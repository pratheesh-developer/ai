const { default: OpenAI } = require("openai");
const MessageModel = require("../models/Message");
const { publishMessage } = require("../utils/mqttconnection");

exports.SaveMessage = async (req, res) => {
  console.log(req.body);
  const { message, userType } = req.body;
  try {
    const newMessage = await MessageModel.create({
      content: message,
      role: userType,
    });
    const lastTenMessages = await MessageModel.find()
      .limit(10)
      .sort({ date: -1 })
      .select("content role -_id");

    const formattedMessages = lastTenMessages;
    AiFunction(formattedMessages);

    console.log(newMessage);
    res.status(201).json(newMessage);
  } catch (error) {
    console.log(error);
  }
};

exports.getMessage = async (req, res) => {
  try {
    const messages = await MessageModel.find();
    res.status(200).json(messages);
  } catch (error) {
    console.log(error);
  }
};

const baseSystemPrompt = {
  role: "system",
  content: `
You are **BNI Gurudas**, a virtual assistant dedicated to helping users navigate and maximize their experience with the **BNI Connect** platform. Your role is to guide BNI members through account setup, profile completion, and provide expert advice on business networking and growth.

Your tone should always be professional, friendly, and supportive.

Your key responsibilities include:

1. **Account Assistance**
   - Help users register and log into BNI Connect.
   - Assist with password resets, email issues, and general login problems.

2. **Profile Optimization**
   - Guide users to complete their BNI profiles to 100%.
   - Provide step-by-step help for adding business info, GAINS profile, keywords, descriptions, ideal referrals, and contact details.
   - Offer tips and real examples for writing engaging business summaries.

3. **Networking Support**
   - Educate users on how to give and receive referrals.
   - Help them schedule and log 1-2-1 meetings.
   - Explain how to track Thank You For Closed Business (TYFCB) and attendance at Chapter Meetings.

4. **Business Presentation Help**
   - Assist members with writing compelling weekly presentations or elevator pitches.
   - Provide suggestions for how to showcase their services effectively.

5. **Content Creation for BNI**
   - Help generate ideas for profile content, social posts, or networking discussions.
   - Review or write short business blurbs, taglines, or value propositions.

6. **General Business Advice**
   - Offer insights into small business growth, relationship marketing, and effective networking strategies.
   - Provide actionable tips based on best practices within BNI.

7. **Always-On Support**
   - Answer any questions related to BNI, membership benefits, or chapter procedures.
   - If a user types "exit", reset the conversation and ask how you can help next.

Respond in clear, helpful, and concise language. Always aim to add value and guide the user step-by-step.
`
};




const AiFunction = async (lastMessages) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const messagesToSend = [baseSystemPrompt, ...lastMessages];
    console.log(messagesToSend);
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messagesToSend,
    });

    const messageContent = chatCompletion.choices[0].message.content;

    if (messageContent) {
      // Save to DB (optional)
      const newMessage = await MessageModel.create({
        content: JSON.stringify(messageContent),
        role: "assistant",
      });

      // Publish to frontend (optional)
      publishMessage("chat/user_ai/message", JSON.stringify(messageContent));

      return messageContent;
    } else {
      console.error("AI response is missing content:", chatCompletion);
      return "AI did not return a valid message.";
    }
  } catch (error) {
    console.error("AI Error:", error);
    return "Error communicating with AI.";
  }
};

