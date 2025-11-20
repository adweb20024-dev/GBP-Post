import { GoogleGenAI } from "@google/genai";
import { PostFormData, GeneratedPost } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateGBPPost = async (formData: PostFormData): Promise<GeneratedPost> => {
  const textPrompt = `
**[SYSTEM INSTRUCTION: ROLE DEFINITION]**
You are a highly specialized Local Marketing Specialist and Copywriter with expertise in optimizing Google Business Profile (GBP) posts for local SEO and engagement. Your primary goal is to drive foot traffic and conversions.

**[CONTEXTUAL VARIABLES]**
The business you are writing for has the following characteristics:
- **Business Name:** ${formData.businessName}
- **Primary Category:** ${formData.category}
- **Service Area/City:** ${formData.city}
- **Target Audience:** ${formData.audience}

**[TASK & INPUT]**
Your task is to generate a single, high-converting **Google Business Profile 'Update' post** based *only* on the provided topic.

The Topic is: **<${formData.topic}>**

**[CONSTRAINTS & OPTIMIZATION RULES]**
1.  **Format:** The output must be separated into two clear sections: POST BODY and CTA BUTTON.
2.  **Character Limit:** Post body must be concise, aiming for visibility. Limit the text to **250-300 characters maximum**.
3.  **SEO:** Naturally integrate the primary city keyword (**${formData.city}**) and the main business category (**${formData.category}**) into the post text.
4.  **Tone:** The tone should be highly **enthusiastic, benefit-driven, and actionable**.
5.  **Engagement:** Include **3 relevant emojis** that enhance the message and visual appeal (do not use more than 3).
6.  **CTA:** The Call-to-Action button text must be appropriate for a GBP post (e.g., 'Learn More', 'Order Online', 'Call Now', 'Book'). Select the most relevant option based on the topic.

**[OUTPUT FORMAT]**
Strictly adhere to this format. Do not include any extra introductory or concluding text.

POST BODY: [Content]
CTA BUTTON: [Button Text]
`;

  const imagePrompt = `A high-quality, photorealistic marketing image for a local business named "${formData.businessName}" (${formData.category}) in ${formData.city}. The image should visually represent: ${formData.topic}. Professional lighting, inviting atmosphere, no text overlays.`;

  try {
    const textPromise = ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: textPrompt,
    });

    const imagePromise = ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: imagePrompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '4:3',
        outputMimeType: 'image/jpeg',
      }
    }).catch((err) => {
      console.error("Image generation failed", err);
      return null;
    });

    const [textResponse, imageResponse] = await Promise.all([textPromise, imagePromise]);

    const text = textResponse.text || "";
    
    // Parse the specific format requested
    const postBodyMatch = text.match(/POST BODY:\s*([\s\S]*?)(?=CTA BUTTON:|$)/i);
    const ctaMatch = text.match(/CTA BUTTON:\s*(.*)/i);

    const body = postBodyMatch ? postBodyMatch[1].trim() : text;
    const cta = ctaMatch ? ctaMatch[1].trim() : "Learn More";

    let imageUrl;
    if (imageResponse && imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
       const base64ImageBytes = imageResponse.generatedImages[0].image.imageBytes;
       imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
    }

    return {
      body,
      cta,
      imageUrl,
      timestamp: Date.now()
    };

  } catch (error) {
    console.error("Error generating post:", error);
    throw new Error("Failed to generate post. Please check your API key and try again.");
  }
};