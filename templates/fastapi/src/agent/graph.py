from __future__ import annotations

import operator
import os
from typing import Annotated, Any, TypedDict

from langchain_core.messages import AIMessage, HumanMessage, ToolMessage
from langchain_openai import AzureChatOpenAI
from langgraph.graph import END, StateGraph
from langgraph.prebuilt import ToolNode

from src.agent.tools import get_active_users, get_user_count


class AgentState(TypedDict):
    messages: Annotated[list[Any], operator.add]
    node_trace: Annotated[list[str], operator.add]


TOOLS = [get_active_users, get_user_count]
TOOL_NODE = ToolNode(TOOLS)


def _has_azure_openai_config() -> bool:
    return all(
        [
            os.getenv("AZURE_OPENAI_ENDPOINT"),
            os.getenv("AZURE_OPENAI_KEY"),
            os.getenv("AZURE_OPENAI_DEPLOYMENT"),
        ]
    )


def _build_llm() -> AzureChatOpenAI:
    return AzureChatOpenAI(
        azure_deployment=os.getenv("AZURE_OPENAI_DEPLOYMENT"),
        azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
        api_key=os.getenv("AZURE_OPENAI_KEY"),
        api_version=os.getenv("OPENAI_API_VERSION", "2025-01-01-preview"),
        temperature=0.1,
    ).bind_tools(TOOLS)


def _build_fallback_ai_message(state: AgentState) -> AIMessage:
    has_tool_output = any(isinstance(message, ToolMessage) for message in state["messages"])
    if has_tool_output:
        return AIMessage(
            content=(
                "User activity report generated from real system data. "
                "Note: fallback mode active because Azure OpenAI env vars are missing."
            )
        )

    return AIMessage(
        content="",
        tool_calls=[
            {
                "name": "get_user_count",
                "args": {},
                "id": "fallback_call_get_user_count",
                "type": "tool_call",
            },
            {
                "name": "get_active_users",
                "args": {"limit": 10},
                "id": "fallback_call_get_active_users",
                "type": "tool_call",
            },
        ],
    )


def call_llm(state: AgentState) -> AgentState:
    if _has_azure_openai_config():
        llm = _build_llm()
        response = llm.invoke(state["messages"])
    else:
        response = _build_fallback_ai_message(state)

    return {"messages": [response], "node_trace": ["call_llm"]}


async def run_tools(state: AgentState) -> AgentState:
    result = await TOOL_NODE.ainvoke(state)
    return {"messages": result["messages"], "node_trace": ["run_tools"]}


def should_continue(state: AgentState) -> str:
    last = state["messages"][-1]
    if isinstance(last, AIMessage) and last.tool_calls:
        return "run_tools"
    return END


graph = StateGraph(AgentState)
graph.add_node("call_llm", call_llm)
graph.add_node("run_tools", run_tools)
graph.set_entry_point("call_llm")
graph.add_conditional_edges("call_llm", should_continue)
graph.add_edge("run_tools", "call_llm")

agent = graph.compile()


def sanitize_prompt(prompt: str) -> str:
    clean = "".join(ch for ch in prompt if ch.isprintable() or ch in "\n\r\t").strip()
    if not clean:
        raise ValueError("Prompt es obligatorio.")
    if len(clean) > 1000:
        raise ValueError("Prompt excede 1000 caracteres.")
    return clean


async def run_agent(prompt: str) -> dict[str, Any]:
    safe_prompt = sanitize_prompt(prompt)
    result = await agent.ainvoke(
        {
            "messages": [HumanMessage(content=safe_prompt)],
            "node_trace": [],
        }
    )

    final_message = result["messages"][-1]
    content = final_message.content if hasattr(final_message, "content") else str(final_message)

    return {
        "response": content,
        "node_trace": result.get("node_trace", []),
        "mode": "llm" if _has_azure_openai_config() else "fallback",
    }
