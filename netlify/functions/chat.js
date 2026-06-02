// netlify/functions/chat.js
// Esta função roda no servidor da Netlify e protege sua API key

exports.handler = async function (event) {

  // Só aceita requisições POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':         'application/json',
        'x-api-key':            process.env.ANTHROPIC_API_KEY, // chave guardada no Netlify
        'anthropic-version':    '2023-06-01',
      },
      body: JSON.stringify({
        model:      body.model      || 'claude-sonnet-4-5',
        max_tokens: body.max_tokens || 1000,
        system:     body.system     || '',
        messages:   body.messages   || [],
      }),
    });

    const data = await response.json();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
