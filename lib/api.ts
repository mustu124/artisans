import { NextResponse } from "next/server";

export function ok<T>(data: T, message = "OK", init?: ResponseInit) {
  return NextResponse.json({ success: true, data, message }, init);
}

export function fail(message = "Something went wrong.", status = 500, data: unknown = null) {
  return NextResponse.json({ success: false, data, message }, { status });
}
