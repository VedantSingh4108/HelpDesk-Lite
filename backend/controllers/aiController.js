const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Get AI response for FAQ Chatbot (Powered by Gemini)
// @route   POST /api/ai/chat
const getChatbotResponse = async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ message: 'Message is required' });
    }

    try {
        // 1. Create your Company Knowledge Base
        // 1. Create your Company Knowledge Base
        const companyKnowledge = `
      You are the official IT Helpdesk Assistant for our company. 
      Use ONLY the following knowledge base to answer user questions. 
      If the answer is not here, politely tell them to submit a support ticket.

      KNOWLEDGE BASE:
      - Tickets usually take 3-4 working days to get resolved.
      - There is a model behind the scenes that categories tickets based on the input you give and flag it as how fast the query needs to be resolved. 
      - If a ticket is flagged as urgent or high priority, it will be resolved faster.
      - Once a ticket is submitted, it is assigned a ticket ID which is unique to each ticket. You can use this ticket ID to refer to your ticket in further communication.
      - A ticket can have multiple comments and updates.
      - you can also talk with the agent assigned to your ticket through edit ticket option in my tickets and there you can chat with your agent.
      - How to Submit a Ticket / Raise an Issue: To report a problem or request help, click on the "Submit a Request" link in the sidebar (or navigate to /submit). Fill out the title, select a category, write a detailed description, and click "Submit Ticket".
      - Checking Ticket Status: You can view updates on your existing issues by clicking "My Tickets" in the sidebar navigation.
      - Password Resets: Employees can reset passwords at account.ourcompany.com/reset.
      - VPN Setup: Download the Cisco AnyConnect client from vpn.ourcompany.com. Use the server address 'vpn-us-east.ourcompany.com'.
      - New Software: To request a license for new software, submit a ticket under the 'Feature Request' category on the submission page.
      - Office Wi-Fi: The guest network is 'Company_Guest' (password: welcome2026). The secure network is 'Company_Secure' (requires employee login).
      - HR & Payroll: For pay stub or salary issues, do not use this IT helpdesk. Email hr@ourcompany.com directly.
    `;

        // 2. Feed the knowledge to Gemini
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-lite-latest",
            systemInstruction: companyKnowledge // <-- Injecting it here!
        });

        const result = await model.generateContent(message);
        const reply = result.response.text();

        res.status(200).json({ reply });

    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ message: 'Failed to communicate with AI server.' });
    }
};

module.exports = { getChatbotResponse };