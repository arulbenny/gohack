import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  const body = await req.json();

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
  You are an AI for a college complaint system.

  Input:
  ${body.title} - ${body.description}

  Return JSON ONLY:
  {
    "category": "Hostel | Mess | Academics | Safety | General",
    "summary": "short 1-line summary"
  }
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  const aiData = JSON.parse(text.replace(/```json|```/g, ""));

  const { data, error } = await supabase
    .from("issues")
    .insert([
      {
        title: body.title,
        description: body.description,
        category: aiData.category,
        status: "Pending",
        upvotes: 0,
      },
    ]);

  return Response.json(data);
}