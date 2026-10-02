#!/usr/bin/env python3
"""Compose print-PDF approval sheets from generated card rasters + layout dumps."""
from __future__ import annotations

import json
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
BODY_LH = 8.0
ADDRESS_MAX_LINES = 5
EMAIL_GAP_MIN = 15.99
PT = 8

INK = (32, 36, 42)
MUTED = (90, 96, 104)
TRIM_C = (55, 65, 81)
BLEED_C = (120, 132, 148)
ADDR_C = (146, 88, 38)
ID_C = (30, 90, 155)
CONTACT_C = (20, 120, 95)
GAP_C = (180, 140, 40)
GAP_FILL = (255, 236, 179)
SHEET = (220, 223, 227)
RULE = (70, 78, 88)
GUIDE = (110, 140, 190)

ROOT = Path(__file__).resolve().parents[1]
FONT_DIR = ROOT / "src/assets/fonts"
OUT_DIR = ROOT / "docs/samples/print-pdf"
TMP = Path(tempfile.gettempdir()) / "colliers-approval-guide"


def font(weight: str, size: int) -> ImageFont.FreeTypeFont:
    name = "OpenSans-Bold.ttf" if weight == "bold" else "OpenSans-Regular.ttf"
    return ImageFont.truetype(str(FONT_DIR / name), size)


def load_dump(kind: str) -> dict:
    return json.loads((TMP / f"{kind}.json").read_text())


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


def fmt_y(value: float) -> str:
    if abs(value - round(value)) < 0.01:
        return str(int(round(value)))
    return f"{value:.2f}".rstrip("0").rstrip(".")


def identity_baselines(dump: dict) -> list[tuple[float, str, tuple[int, int, int], bool]]:
    """Return (y, label, color, active) for identity / contact baselines."""
    rows: list[tuple[float, str, tuple[int, int, int], bool]] = []
    name_ys = dump.get("nameLineYs") or []
    name_lines = dump.get("nameLines") or []
    for i, y in enumerate(name_ys):
        tag = "name" if len(name_ys) == 1 else f"name L{i + 1}"
        sample = name_lines[i] if i < len(name_lines) else ""
        rows.append((float(y), f"{tag}  Y = {fmt_y(y)}" + (f"  ·  {sample}" if sample else ""), ID_C, True))

    if dump.get("credentialY") is not None:
        y = float(dump["credentialY"])
        cred = dump.get("credentialLine") or "credentials"
        rows.append((y, f"credentials  Y = {fmt_y(y)}  ·  {cred}", ID_C, True))

    if dump.get("title"):
        y = float(dump["titleY"])
        rows.append((y, f"title  Y = {fmt_y(y)}", ID_C, True))

    team = dump.get("team") or ""
    team_y = float(dump.get("teamY") or 58.99)
    if team:
        rows.append((team_y, f"team  Y = {fmt_y(team_y)}  ·  {team}", ID_C, True))
    else:
        rows.append((team_y, f"team slot  Y = {fmt_y(team_y)}  (empty / optional)", MUTED, False))

    for key, label, color in (
        ("emailY", "email", CONTACT_C),
        ("phoneY", "mobile", CONTACT_C),
        ("websiteY", "website", CONTACT_C),
    ):
        y = float(dump[key])
        rows.append((y, f"{label}  Y = {fmt_y(y)}", color, True))

    # Stable top→bottom for drawing, then label list can stay near lines
    rows.sort(key=lambda r: -r[0])
    return rows


def address_baselines(dump: dict) -> list[tuple[float, str, bool]]:
    """Address stacks up from bottomY; show used + unused max slots (count from bottom)."""
    bottom = float(dump.get("addressBottomY") or 27)
    used_lines = dump.get("addressLines") or []
    used = len(used_lines)
    rows = []
    for i in range(ADDRESS_MAX_LINES):
        y = bottom + i * BODY_LH
        active = i < used
        # i=0 is the bottom printed line; higher i moves toward the logo.
        if active:
            # Reverse index into used_lines: bottom row is the last string.
            text = used_lines[used - 1 - i]
            short = text if len(text) <= 28 else text[:27] + "…"
            label = f"addr {i + 1}/{ADDRESS_MAX_LINES}  Y = {fmt_y(y)}  ·  {short}"
        else:
            label = f"addr max {i + 1}/{ADDRESS_MAX_LINES}  Y = {fmt_y(y)}  (unused)"
        rows.append((y, label, active))
    return rows


def draw_gap_band(draw, sx, sy, dump, small_f):
    """Shade approved air between last active identity line and email."""
    email_y = float(dump["emailY"])
    last_y = email_y + EMAIL_GAP_MIN
    team = dump.get("team") or ""
    if team:
        last_y = float(dump["teamY"])
    elif dump.get("title"):
        # Standard without team: gap is title → email (client-approved short-card air)
        last_y = float(dump["titleY"])

    if last_y <= email_y:
        return

    x1 = sx(IDENTITY_X)
    x2 = sx(IDENTITY_X + IDENTITY_W)
    y_top = sy(last_y)
    y_bot = sy(email_y)
    # sy flips Y: higher PDF y → smaller image y
    top, bot = min(y_top, y_bot), max(y_top, y_bot)
    overlay = Image.new("RGBA", (int(x2 - x1), int(bot - top)), GAP_FILL + (90,))
    # Caller pastes onto RGB sheet — draw a hatched feel with lines instead
    draw.rectangle([x1, top, x2, bot], outline=GAP_C, width=1)
    for yy in range(int(top) + 6, int(bot), 10):
        dashed_line(draw, (x1 + 2, yy), (x2 - 2, yy), GAP_C, width=1, dash=6, gap=6)

    gap_pt = last_y - email_y
    label = f"approved air  {fmt_y(gap_pt)} pt  (last identity → email)"
    tw, th = text_size(draw, label, small_f)
    draw.text((x1 + 6, (top + bot) / 2 - th / 2), label, font=small_f, fill=GAP_C)


def draw_y_guides(draw, sx, sy, dump, small_f, label_x_right: float, label_x_left: float):
    """Horizontal baselines + labels for identity, contacts, and address max stack."""
    draw_gap_band(draw, sx, sy, dump, small_f)

    id_x1 = sx(IDENTITY_X)
    id_x2 = sx(IDENTITY_X + IDENTITY_W)
    for y, label, color, active in identity_baselines(dump):
        yy = sy(y)
        if active:
            draw.line([(id_x1, yy), (id_x2, yy)], fill=color, width=2)
            draw.line([(id_x2, yy), (label_x_right - 8, yy)], fill=GUIDE, width=1)
        else:
            dashed_line(draw, (id_x1, yy), (id_x2, yy), color, width=1, dash=5, gap=5)
            dashed_line(draw, (id_x2, yy), (label_x_right - 8, yy), MUTED, width=1, dash=4, gap=5)
        draw.ellipse([label_x_right - 14, yy - 3, label_x_right - 8, yy + 3], fill=color if active else MUTED)
        draw.text((label_x_right, yy - 7), label, font=small_f, fill=color if active else MUTED)

    addr_x1 = sx(ADDRESS_X)
    addr_x2 = sx(ADDRESS_X + ADDRESS_W)
    for y, label, active in address_baselines(dump):
        yy = sy(y)
        color = ADDR_C if active else (170, 150, 130)
        if active:
            draw.line([(addr_x1, yy), (addr_x2, yy)], fill=color, width=2)
            draw.line([(label_x_left + 8, yy), (addr_x1, yy)], fill=GUIDE, width=1)
        else:
            dashed_line(draw, (addr_x1, yy), (addr_x2, yy), color, width=1, dash=4, gap=5)
            dashed_line(draw, (label_x_left + 8, yy), (addr_x1, yy), MUTED, width=1, dash=4, gap=5)
        draw.ellipse([label_x_left, yy - 3, label_x_left + 6, yy + 3], fill=color)
        tw, _ = text_size(draw, label, small_f)
        draw.text((label_x_left - 8 - tw, yy - 7), label, font=small_f, fill=color)


def compose(kind: str, card_path: Path, out_path: Path):
    dump = load_dump(kind)
    card = Image.open(card_path).convert("RGB")
    left = 280
    right = 420
    top = 130
    bottom = 400 if kind == "maximum" else 320
    sheet = Image.new("RGB", (left + card.width + right, top + card.height + bottom), SHEET)
    draw = ImageDraw.Draw(sheet)
    title_f = font("bold", 32)
    sub_f = font("regular", 17)
    label_f = font("regular", 16)
    small_f = font("regular", 13)

    if kind == "standard":
        title = "Standard card"
        sub = "Typical finished print PDF — baselines from production layout (PDF Y, bottom-up)"
    else:
        title = "Maximum-content card"
        sub = "Demanding valid stack — own-row credentials + lift so team sits at Y = 58.99"

    draw.text((left, 22), title, font=title_f, fill=INK)
    draw.text((left, 64), sub, font=sub_f, fill=MUTED)
    mode = dump.get("credMode") or ""
    draw.text(
        (left, 90),
        f"Mode: {mode}  ·  Contacts locked at email 43 / mobile 35 / website 27  ·  Address max 5 lines @ 8 pt",
        font=small_f,
        fill=MUTED,
    )

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

    v_bracket(draw, cx - 36, ty, ty + TRIM_H * PT, ["Trim  144 pt", "2 in"], TRIM_C, small_f)

    draw_y_guides(
        draw,
        sx,
        sy,
        dump,
        small_f,
        label_x_right=cx + card.width + 18,
        label_x_left=cx - 18,
    )

    y_anchor = cy + card.height + 18
    for px, color, label in (
        (ADDRESS_X, ADDR_C, "Address  X = 27 pt"),
        (IDENTITY_X, ID_C, "Identity  X = 113.03 pt"),
    ):
        x = sx(px)
        draw.line([(x, cy + card.height + 2), (x, y_anchor + 14)], fill=color, width=2)
        draw.text((x + 8, y_anchor), label, font=small_f, fill=color)

    y1 = y_anchor + 40
    h_bracket(draw, cx, cx + card.width, y1, "PDF media  270 x 162 pt  /  3.75 x 2.25 in", RULE, label_f)
    y2 = y1 + 50
    h_bracket(draw, tx, tx + TRIM_W * PT, y2, "Final trim  252 x 144 pt  /  3.5 x 2 in", TRIM_C, label_f)

    y3 = y2 + 58
    h_bracket(draw, sx(ADDRESS_X), sx(ADDRESS_X + ADDRESS_W), y3, "Address area  80 pt", ADDR_C, label_f)
    h_bracket(draw, sx(IDENTITY_X), sx(IDENTITY_X + IDENTITY_W), y3, "Identity / content  130 pt", ID_C, label_f)

    legend = (
        "Y = PDF baseline (0 at page bottom). Solid = used line. Dashed = empty optional / unused address max slot. "
        "Hatched band = approved air above email (do not pack short cards up)."
    )
    draw.text((left, sheet.height - 56), legend, font=small_f, fill=MUTED)
    note = "Production PDF source of truth  ·  MediaBox = BleedBox = 270 x 162 pt  ·  TrimBox = [9, 9, 261, 153]"
    draw.text((left, sheet.height - 32), note, font=small_f, fill=MUTED)

    sheet.save(out_path, "PNG", optimize=True)
    print("wrote", out_path, sheet.size)


def rasterize_front(pdf_path: Path, png_path: Path):
    doc = fitz.open(pdf_path)
    pix = doc[0].get_pixmap(matrix=fitz.Matrix(PT, PT), alpha=False)
    pix.save(png_path)


def compose_credentials_spacing(standard_path: Path, maximum_path: Path, out_path: Path):
    """Side-by-side Standard vs Maximum with the same Y baseline callouts."""
    std = Image.open(standard_path).convert("RGB")
    mx = Image.open(maximum_path).convert("RGB")
    std_dump = load_dump("standard")
    mx_dump = load_dump("maximum")

    label_rail = 300
    gap = 40
    left = 260
    right = 300
    top = 160
    bottom = 220
    panel_w = max(std.width, mx.width)
    sheet_w = left + panel_w + label_rail + gap + panel_w + right
    sheet_h = top + max(std.height, mx.height) + bottom
    sheet = Image.new("RGB", (sheet_w, sheet_h), SHEET)
    draw = ImageDraw.Draw(sheet)
    title_f = font("bold", 30)
    sub_f = font("regular", 16)
    label_f = font("regular", 15)
    small_f = font("regular", 12)
    mode_f = font("bold", 18)

    draw.text((48, 20), "Credentials spacing — two automatic modes + Y baselines", font=title_f, fill=INK)
    draw.text(
        (48, 62),
        "Office name is not printed. Y values are production PDF baselines (bottom-up).",
        font=sub_f,
        fill=MUTED,
    )
    draw.text(
        (48, 90),
        "Locked contacts: email 43 · mobile 35 · website 27  ·  Address max 5 lines from Y = 27 @ 8 pt  ·  Max last-identity floor Y = 58.99",
        font=small_f,
        fill=MUTED,
    )
    draw.text(
        (48, 114),
        "Address X = 27 · Identity X = 113.03 · Address 80 pt · Identity 130 pt · Email lane 132 pt",
        font=small_f,
        fill=MUTED,
    )

    panels = (
        (left, std, std_dump, "Standard  ·  INLINE", "Name Y = 75.49 · title Y = 66.99 · short-card air above email"),
        (
            left + panel_w + label_rail + gap,
            mx,
            mx_dump,
            "Maximum  ·  OWN ROW",
            "Lifted stack — last identity (team) at Y = 58.99 · ~16 pt air above email",
        ),
    )
    for cx, card, dump, heading, blurb in panels:
        cy = top
        draw.text((cx, cy - 52), heading, font=mode_f, fill=INK)
        draw.text((cx, cy - 26), blurb, font=small_f, fill=MUTED)
        sheet.paste(card, (cx, cy))
        draw.rectangle(
            [cx, cy, cx + card.width - 1, cy + card.height - 1],
            outline=(170, 176, 184),
            width=1,
        )

        def sx(px, origin=cx):
            return origin + px * PT

        def sy(py, origin_y=cy):
            return origin_y + (PAGE_H - py) * PT

        tx, ty = sx(BLEED), sy(BLEED + TRIM_H)
        dashed_rect(draw, tx, ty, TRIM_W * PT, TRIM_H * PT, TRIM_C, 2)
        draw_y_guides(
            draw,
            sx,
            sy,
            dump,
            small_f,
            label_x_right=cx + card.width + 14,
            label_x_left=cx - 14,
        )

    y = top + max(std.height, mx.height) + 36
    note = (
        "Solid lines = used baselines from planProductLayout. Dashed = empty team slot or unused address max. "
        "Hatched band = approved air above email. Regenerated with export:approval-guide."
    )
    draw.text((48, y), note, font=small_f, fill=MUTED)
    draw.text(
        (48, sheet.height - 32),
        "Production PDF source of truth  ·  MediaBox = BleedBox = 270 x 162 pt  ·  TrimBox = [9, 9, 261, 153]",
        font=small_f,
        fill=MUTED,
    )
    sheet.save(out_path, "PNG", optimize=True)
    print("wrote", out_path, sheet.size)


def main():
    rasterize_front(TMP / "standard.pdf", TMP / "standard-card.png")
    rasterize_front(TMP / "maximum.pdf", TMP / "maximum-card.png")
    compose("standard", TMP / "standard-card.png", OUT_DIR / "Colliers-Print-PDF-Approval-Standard.png")
    compose("maximum", TMP / "maximum-card.png", OUT_DIR / "Colliers-Print-PDF-Approval-Maximum.png")
    compose_credentials_spacing(
        TMP / "standard-card.png",
        TMP / "maximum-card.png",
        OUT_DIR / "Colliers-Print-PDF-Credentials-Spacing.png",
    )


if __name__ == "__main__":
    main()
