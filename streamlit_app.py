from pathlib import Path

import streamlit as st
import streamlit.components.v1 as components


APP_DIR = Path(__file__).resolve().parent

st.set_page_config(
    page_title="StudyFlow — Học tập có kế hoạch",
    page_icon="📚",
    layout="wide",
    initial_sidebar_state="collapsed",
)


def build_html() -> str:
    html = (APP_DIR / "index.html").read_text(encoding="utf-8")
    css = (APP_DIR / "styles.css").read_text(encoding="utf-8")
    javascript = (APP_DIR / "app.js").read_text(encoding="utf-8")
    html = html.replace(
        '<link rel="stylesheet" href="styles.css" />',
        f"<style>{css}</style>",
    )
    html = html.replace(
        '<script src="app.js" defer></script>',
        "",
    )
    html = html.replace("</body>", f"<script>{javascript}</script>\n</body>")
    return html


components.html(build_html(), height=1_200, scrolling=True)
