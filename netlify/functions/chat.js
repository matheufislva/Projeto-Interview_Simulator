// netlify/functions/chat.js
// Função serverless Netlify para integração com Anthropic API
// 
// Uso:
// POST /.netlify/functions/chat
// Body: { messages, system, model, max_tokens }
// Response: { content: [...] }

const Anthropic = require("@anthropic-ai/sdk");

exports.handler = async (event) => {
  // Configuração CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };

  // Responder a preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: ""
    };
  }

  // Apenas POST permitido
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Método não permitido" })
    };
  }

  try {
    // Parsear body
    const { messages, system, model = "claude-opus-4-6", max_tokens = 1000 } = JSON.parse(event.body);

    // Validação
    if (!messages || !Array.isArray(messages)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Campo 'messages' é obrigatório e deve ser um array" })
      };
    }

    // Verificar API Key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error("ANTHROPIC_API_KEY não configurada");
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Configuração do servidor incompleta" })
      };
    }

    // Criar cliente Anthropic
    const client = new Anthropic({ apiKey });

    // Preparar payload
    const payload = {
      model,
      max_tokens,
      messages
    };

    // Adicionar system prompt se fornecido
    if (system) {
      payload.system = system;
    }

    // Fazer chamada à API
    console.log(`[Claude API] Requisição: model=${model}, tokens=${max_tokens}`);
    
    const response = await client.messages.create(payload);

    console.log(`[Claude API] Resposta recebida com sucesso`);

    // Retornar resposta
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error("[Chat Function] Erro:", error);

    // Tratamento específico de erros
    let statusCode = 500;
    let errorMessage = "Erro ao processar requisição";

    if (error.status === 401) {
      statusCode = 401;
      errorMessage = "API Key inválida";
    } else if (error.status === 429) {
      statusCode = 429;
      errorMessage = "Limite de requisições atingido";
    } else if (error.status === 400) {
      statusCode = 400;
      errorMessage = error.message || "Requisição inválida";
    }

    return {
      statusCode,
      headers: {
        ...headers,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        error: errorMessage,
        details: error.message
      })
    };
  }
};
