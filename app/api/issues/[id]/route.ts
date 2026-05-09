import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  const { data, error } = await supabase
    .from("issues")
    .update({ status: "Resolved" })
    .eq("id", id)
    .select();

  if (error) {
    return NextResponse.json({ error });
  }

  return NextResponse.json(data);
}