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

    const formattedMessages = lastTenMessages.reverse();
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
You are a virtual assistant specialized in helping users navigate and maximize their experience with the BNI Connect platform. Your role is to guide members through account setup, profile completion, and provide expert advice on business networking and growth.

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
  `,
};

const AiFunction = async (lastMessages) => {
  try {
    // Add the system prompt at the start and append the last user messages
    const messagesToSend = [baseSystemPrompt, ...lastMessages];
    // console.log(messagesToSend);
    // Log for debugging
    console.log("Sending to AI:", messagesToSend);

    // Send the request to the API
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3-8b-instruct", // Ensure you're using the correct model
          messages: messagesToSend,
        }),
      }
    );

    // Get the response data from the API
    const data = await response.json();

    // Check if the response contains a valid message
    if (data?.choices?.[0]?.message?.content) {
      const messageContent = data.choices[0].message.content;

      // Save the message content to your database (optional)
      const newMessage = await MessageModel.create({
        content: JSON.stringify(messageContent),
        role: "assistant",
      });

      // Publish the assistant's response to your channel (optional)
      publishMessage("chat/user_ai/message", JSON.stringify(messageContent));

      // Return the AI's response
      return messageContent;
    } else {
      console.error("AI response error:", data);
      return "AI did not return a valid message.";
    }
  } catch (error) {
    console.error("AI Error:", error);
    return "Error communicating with AI.";
  }
};
