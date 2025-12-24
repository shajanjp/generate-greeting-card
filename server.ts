import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  const url = new URL(req.url);

  if (req.method !== "POST" || url.pathname !== "/api/greetings") {
    return new Response("Not Found", { status: 404 });
  }

  try {
    const { name } = await req.json();

    if (!name || typeof name !== "string") {
      return new Response("Invalid name", { status: 400 });
    }

    // Sanitize name
    const safeName = name.replace(/[^a-zA-Z0-9 ,&]/g, "").trim();
    const id = crypto.randomUUID();

    const textImage = `output/text-${id}.jpg`;
    const finalImageFileName = `greeting-${id}.jpg`;
    const finalImage = `output/${finalImageFileName}`;

    // Step 1: Create text image
    const textCmd = new Deno.Command("magick", {
      args: [
        "assets/xmas/xmas-wish-greeting.jpg",
        "-font",
        "assets/xmas/Bellefair-Regular.ttf",
        "-pointsize",
        "32",
        "-fill",
        "#555",
        "-gravity",
        "North",
        "-annotate",
        "+0+84",
        `Dear ${safeName},`,
        textImage,
      ],
    });

    const textResult = await textCmd.output();
    if (!textResult.success) throw new Error("Text image failed");

    // Step 2: Combine images
    const appendCmd = new Deno.Command("magick", {
      args: [
        "assets/xmas/tree.jpg",
        textImage,
        "+append",
        finalImage,
      ],
    });

    const appendResult = await appendCmd.output();
    if (!appendResult.success) throw new Error("Append failed");

    // Read final image
    const imageBytes = await Deno.readFile(finalImage);

    // Optional cleanup
    await Promise.allSettled([
      Deno.remove(textImage),
      Deno.remove(finalImage),
    ]);

    return new Response(imageBytes, {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": `inline; filename="${finalImageFileName}"`,
      },
    });

  } catch (err) {
    return new Response(
      `Error generating greeting: ${err.message}`,
      { status: 500 }
    );
  }
});
