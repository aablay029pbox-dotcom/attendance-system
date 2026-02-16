import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export const POST = async (req) => {
  try {
    const body = await req.json();
    const { lastname, firstname, course, yearSection } = body;

    if (!lastname || !firstname || !course || !yearSection) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const { data, error } = await supabase.from("students").insert([
      {
        lastname,
        firstname,
        course,
        yearsection: yearSection,
      },
    ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Student saved successfully", data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};
