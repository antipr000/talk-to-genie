const OpenAI = require('openai');

const openai = new OpenAI({
  key: process.env.OPEN,
});


async function getChatCompletion(query) {
    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'user', content: query },
        ],
    });

    return response.choices[0].message.content;
}

async function getChatCompletionCached(query) {
    return "Design patterns are reusable solutions to common problems that arise in software design. They provide a template for how to structure code in a way that makes it more efficient, maintainable, and scalable.\n\nDesign patterns are important because they offer a proven way to solve common design problems, allowing developers to avoid reinventing the wheel and saving time and effort. By using design patterns, developers can improve the quality of their code, make it easier to understand and maintain, and ensure that their solutions are in line with best practices.\n\nAdditionally, design patterns help facilitate communication between team members by providing a common language and understanding of how code should be structured. They also help new developers quickly familiarize themselves with a codebase and contribute effectively to a project."
}

module.exports = { getChatCompletionCached, getChatCompletion };
