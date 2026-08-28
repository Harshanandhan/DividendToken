"""PNGs from results/tests.json."""

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
IMG = ROOT / "images"
FONT_DIR = Path(r"C:\Windows\Fonts")
NAVY = (15, 23, 42)
WHITE = (248, 250, 252)
MUTED = (148, 163, 184)
LINE = (30, 41, 59)
ACCENT = (56, 189, 248)
OK = (16, 185, 129)


def font(name: str, size: int):
    for n in (name, "segoeui.ttf", "arial.ttf"):
        p = FONT_DIR / n
        if p.exists():
            return ImageFont.truetype(str(p), size)
    return ImageFont.load_default()


def architecture():
    w, h = 1400, 640
    im = Image.new("RGB", (w, h), NAVY)
    d = ImageDraw.Draw(im)
    title, body, small = font("segoeuib.ttf", 36), font("segoeui.ttf", 22), font("segoeui.ttf", 18)
    d.text((48, 36), "How this token works", font=title, fill=WHITE)
    d.text((48, 88), "Harsha Nandhan Reddy Gajulapalli  ·  Hardhat local tests, not a mainnet deploy", font=small, fill=MUTED)
    boxes = [
        (50, 180, 360, 420, "mint / burn", "send ETH -> DTK\n1 ETH = 1000 DTK\nburn returns reserve ETH"),
        (410, 180, 800, 420, "dividends", "owner: distributeDividends\nholder: withdrawDividends\npull, proportional to balance"),
        (850, 180, 1350, 420, "stake", "tokens move to the contract\nstaked balance does not\nkeep holder dividends"),
    ]
    for x1, y1, x2, y2, head, desc in boxes:
        d.rounded_rectangle((x1, y1, x2, y2), 18, fill=LINE)
        d.text((x1 + 24, y1 + 28), head, font=body, fill=ACCENT)
        d.multiline_text((x1 + 24, y1 + 90), desc, font=small, fill=WHITE, spacing=8)
    d.text((48, 480), "ReentrancyGuard on mint, burn, withdraw, stake, unstake. onlyOwner on dividend and staking-pool deposits.", font=small, fill=MUTED)
    d.text((48, 560), "harshanandhanreddy820@gmail.com", font=small, fill=MUTED)
    IMG.mkdir(exist_ok=True)
    im.save(IMG / "architecture.png")


def results_card(data: dict):
    groups = data["groups"]
    w, h = 1400, 140 + 86 * len(groups) + 80
    im = Image.new("RGB", (w, h), NAVY)
    d = ImageDraw.Draw(im)
    title, body, small = font("segoeuib.ttf", 32), font("segoeui.ttf", 22), font("segoeui.ttf", 18)
    d.text((48, 28), "Results  ·  Hardhat test", font=title, fill=WHITE)
    d.text(
        (48, 76),
        f"{data['passing']} passing  ·  {data['failing']} failing  ·  {data['duration_ms']}ms  ·  {data['author']}",
        font=small,
        fill=MUTED,
    )
    y = 140
    for g in groups:
        d.rounded_rectangle((48, y, 1352, y + 72), 14, fill=LINE)
        d.rounded_rectangle((72, y + 20, 160, y + 52), 8, fill=OK)
        d.text((88, y + 26), "PASS", font=small, fill=WHITE)
        d.text((184, y + 22), f"{g['name']}  ({g['count']})", font=body, fill=WHITE)
        y += 86
    im.save(IMG / "results-tests.png")


def main():
    data = json.loads((ROOT / "results" / "tests.json").read_text(encoding="utf-8"))
    architecture()
    results_card(data)
    print("wrote", list(IMG.glob("*.png")))


if __name__ == "__main__":
    main()
