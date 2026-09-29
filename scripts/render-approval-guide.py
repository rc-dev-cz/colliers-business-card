#!/usr/bin/env python3
"""Compose two print-PDF approval sheets from generated card rasters."""
from __future__ import annotations

import math
import tempfile
from pathlib import Path

import fitz
from PIL import Image, ImageDraw, ImageFont

PAGE_W = 270.0
PAGE_H = 162.0
BLEED = 9.0
TRIM_W = 252.0
TRIM_H = 144.0
ADDRESS_X = 27.0
IDENTITY_X = 113.03
ADDRESS_W = 80.0
IDENTITY_W = 130.0
PT = 8

INK = (32, 36, 42)
MUTED = (90, 96, 104)
TRIM_C = (55, 65, 81)
BLEED_C = (120, 132, 148)
ADDR_C = (146, 88, 38)
ID_C = (30, 90, 155)
SHEET = (220, 223, 227)
RULE = (70, 78, 88)

ROOT = Path(__file__).resolve().parents[1]
FONT_DIR = ROOT / "src/assets/fonts"
OUT_DIR = ROOT / "docs/samples/print-pdf"
TMP = Path(tempfile.gettempdir()) / "colliers-approval-guide"


def font(weight: str, size: int) -> ImageFont.FreeTypeFont:
    name = "OpenSans-Bold.ttf" if weight == "bold" else "OpenSans-Regular.ttf"
    return ImageFont.truetype(str(FONT_DIR / name), size)


def dashed_line(draw, a, b, fill, width=2, dash=11, gap=8):
    x1, y1 = a
    x2, y2 = b
    dx, dy = x2 - x1, y2 - y1
    length = math.hypot(dx, dy) or 1
    ux, uy = dx / length, dy / length
    t = 0.0
    on = True
    while t < length:
        step = dash if on else gap
        t2 = min(length, t + step)
        if on:
            draw.line([(x1 + ux * t, y1 + uy * t), (x1 + ux * t2, y1 + uy * t2)], fill=fill, width=width)
        t = t2
        on = not on


def dashed_rect(draw, x, y, w, h, fill, width=2):
    dashed_line(draw, (x, y), (x + w, y), fill, width)
    dashed_line(draw, (x + w, y), (x + w, y + h), fill, width)
    dashed_line(draw, (x + w, y + h), (x, y + h), fill, width)
    dashed_line(draw, (x, y + h), (x, y), fill, width)


def text_size(draw, text, fnt):
    b = draw.textbbox((0, 0), text, font=fnt)
    return b[2] - b[0], b[3] - b[1]


def h_bracket(draw, x1, x2, y, label, fill, fnt, label_at="center"):
    draw.line([(x1, y), (x2, y)], fill=fill, width=2)
    draw.line([(x1, y - 9), (x1, y + 9)], fill=fill, width=2)
    draw.line([(x2, y - 9), (x2, y + 9)], fill=fill, width=2)
    tw, _ = text_size(draw, label, fnt)
    if label_at == "left":
        tx = x1 + 8
    else:
        tx = (x1 + x2) / 2 - tw / 2
    draw.text((tx, y + 12), label, font=fnt, fill=fill)


def v_bracket(draw, x, y1, y2, lines, fill, fnt):
    draw.line([(x, y1), (x, y2)], fill=fill, width=2)
    draw.line([(x - 9, y1), (x + 9, y1)], fill=fill, width=2)
    draw.line([(x - 9, y2), (x + 9, y2)], fill=fill, width=2)
    text = "\n".join(lines)
    b = draw.multiline_textbbox((0, 0), text, font=fnt, spacing=1, align="right")
    tw, th = b[2] - b[0], b[3] - b[1]
    draw.multiline_text(
        (x - 18 - tw, (y1 + y2) / 2 - th / 2),
        text,
        font=fnt,
        fill=fill,
        align="right",
        spacing=1,
    )


def compose(kind: str, card_path: Path, out_path: Path):
    card = Image.open(card_path).convert("RGB")
    left = 220
    right = 48
    top = 122
    bottom = 348 if kind == "maximum" else 220
    sheet = Image.new("RGB", (left + card.width + right, top + card.height + bottom), SHEET)
    draw = ImageDraw.Draw(sheet)
    title_f = font("bold", 32)
    sub_f = font("regular", 17)
    label_f = font("regular", 16)
    small_f = font("regular", 14)

    if kind == "standard":
        title = "Standard card"
        sub = "Typical finished print PDF using the approved sample content"
    else:
        title = "Maximum-content card"
        sub = "Finished print PDF using a demanding but still valid combination of allowed content"

    draw.text((left, 28), title, font=title_f, fill=INK)
    draw.text((left, 70), sub, font=sub_f, fill=MUTED)

    cx, cy = left, top
    sheet.paste(card, (cx, cy))
    draw.rectangle([cx, cy, cx + card.width - 1, cy + card.height - 1], outline=(170, 176, 184), width=1)

    def sx(px):
        return cx + px * PT

    def sy(py):
        return cy + (PAGE_H - py) * PT

    tx, ty = sx(BLEED), sy(BLEED + TRIM_H)
    dashed_rect(draw, tx, ty, TRIM_W * PT, TRIM_H * PT, TRIM_C, 2)

    bleed_txt = "Bleed  9 pt / 1/8 in  on every side"
    tw, _ = text_size(draw, bleed_txt, small_f)
    bx = sx(PAGE_W / 2)
    draw.text((bx - tw / 2, cy - 28), bleed_txt, font=small_f, fill=BLEED_C)
    draw.line([(bx, cy - 8), (bx, cy)], fill=BLEED_C, width=2)

    v_bracket(draw, cx - 32, ty, ty + TRIM_H * PT, ["Trim  144 pt", "2 in"], TRIM_C, small_f)

    y_anchor = cy + card.height + 18
    for px, color, label in (
        (ADDRESS_X, ADDR_C, "Address  X = 27 pt"),
        (IDENTITY_X, ID_C, "Identity  X = 113.03 pt"),
    ):
        x = sx(px)
        draw.line([(x, cy + card.height + 2), (x, y_anchor + 14)], fill=color, width=2)
        draw.text((x + 8, y_anchor), label, font=small_f, fill=color)

    y1 = y_anchor + 36
    h_bracket(draw, cx, cx + card.width, y1, "PDF media  270 x 162 pt  /  3.75 x 2.25 in", RULE, label_f)
    y2 = y1 + 50
    h_bracket(draw, tx, tx + TRIM_W * PT, y2, "Final trim  252 x 144 pt  /  3.5 x 2 in", TRIM_C, label_f)

    if kind == "maximum":
        y3 = y2 + 72
        h_bracket(draw, sx(ADDRESS_X), sx(ADDRESS_X + ADDRESS_W), y3, "Address area  80 pt", ADDR_C, label_f)
        h_bracket(draw, sx(IDENTITY_X), sx(IDENTITY_X + IDENTITY_W), y3, "Identity / content  130 pt", ID_C, label_f)

    note = "Production PDF source of truth  ·  MediaBox = BleedBox = 270 x 162 pt  ·  TrimBox = [9, 9, 261, 153]"
    draw.text((left, sheet.height - 32), note, font=small_f, fill=MUTED)

    sheet.save(out_path, "PNG", optimize=True)
    print("wrote", out_path, sheet.size)


def rasterize_front(pdf_path: Path, png_path: Path):
    doc = fitz.open(pdf_path)
    pix = doc[0].get_pixmap(matrix=fitz.Matrix(PT, PT), alpha=False)
    pix.save(png_path)


def main():
    rasterize_front(TMP / "standard.pdf", TMP / "standard-card.png")
    rasterize_front(TMP / "maximum.pdf", TMP / "maximum-card.png")
    compose("standard", TMP / "standard-card.png", OUT_DIR / "Colliers-Print-PDF-Approval-Standard.png")
    compose("maximum", TMP / "maximum-card.png", OUT_DIR / "Colliers-Print-PDF-Approval-Maximum.png")


if __name__ == "__main__":
    main()
