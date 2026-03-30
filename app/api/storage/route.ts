import { NextRequest, NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/fs-storage";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 });
  
  const data = await readJsonFile(key, null);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { key, data } = await req.json();
  if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 });
  
  await writeJsonFile(key, data);
  return NextResponse.json({ success: true });
}
