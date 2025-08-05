import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || ""
});

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  message: string;
  suggestions?: string[];
  error?: string;
}

export class HonorariosMedicosAgent {
  private systemPrompt = `Eres el "Agente HonorariosMedicos", un asistente de IA especializado en honorarios médicos y gestión de pagos médicos. 

Tu función es ayudar a los usuarios con:
- Consultas sobre reglas de cálculo de honorarios
- Explicaciones sobre tipos de participación médica
- Dudas sobre configuración de médicos y sociedades
- Interpretación de datos de prestaciones médicas
- Resolución de problemas con el sistema de pagos
- Orientación sobre procesos administrativos

Contexto del sistema:
- Portal de Pagos Médicos con módulo de Maestros
- Gestión de usuarios, médicos, prestaciones y reglas de cálculo
- Tipos de participación: Individual, Sociedad, Mixto
- Cálculos basados en porcentajes o montos fijos
- Criterios por especialidad, horario, días de la semana
- Integración con Fonasa y otros convenios

Responde de manera profesional, clara y precisa. Si no tienes información específica, indica que necesitas más detalles y sugiere consultar con el equipo técnico.

IMPORTANTE: Debes responder siempre en formato JSON con la estructura: {"message": "tu respuesta aquí"}`;

  async processMessage(message: string, conversationHistory: AIMessage[] = [], user?: any, userDoctor?: any): Promise<AIResponse> {
    try {
      // Build context message with user info
      let contextMessage = this.systemPrompt;
      if (user) {
        contextMessage += `\n\nUsuario actual conectado:
- Email: ${user.email || 'No disponible'}
- Nombre: ${user.firstName || ''} ${user.lastName || ''}
- ID: ${user.id}`;

        if (userDoctor) {
          contextMessage += `\n\nPerfil de médico asociado:
- RUT: ${userDoctor.rut}
- Nombre: ${userDoctor.name}
- Especialidad: ${userDoctor.specialtyName || 'No especificada'}
- Tipo de sociedad: ${userDoctor.societyType === 'individual' ? 'Individual' : 'Sociedad médica'}
- Sociedad: ${userDoctor.societyName || 'N/A'}`;
        }

        contextMessage += `\n\nPersonaliza tus respuestas según el usuario y referénciate a él por su nombre cuando sea apropiado. Si tiene perfil de médico, considera esto en tus respuestas.`;
      }

      const messages: AIMessage[] = [
        { role: 'system', content: contextMessage },
        ...conversationHistory.slice(-10), // Keep last 10 messages for context
        { role: 'user', content: message }
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        max_tokens: 500,
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      const responseText = response.choices[0].message.content;
      if (!responseText) {
        throw new Error("No response from OpenAI");
      }

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(responseText);
      } catch {
        // If not valid JSON, return as simple message
        parsedResponse = { message: responseText };
      }

      return {
        message: parsedResponse.message || responseText,
        suggestions: parsedResponse.suggestions || []
      };

    } catch (error) {
      console.error("Error processing AI message:", error);
      return {
        message: "Lo siento, hubo un error procesando tu consulta. Por favor intenta nuevamente o contacta al equipo de soporte.",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  async analyzeCalculationRule(rule: any): Promise<AIResponse> {
    try {
      const prompt = `Analiza la siguiente regla de cálculo de honorarios médicos y proporciona insights útiles:

Regla: ${JSON.stringify(rule, null, 2)}

Responde en formato JSON con:
- message: análisis detallado de la regla
- suggestions: array de sugerencias para optimización o mejoras
- warnings: array de posibles problemas o conflictos`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      const responseText = response.choices[0].message.content;
      if (!responseText) {
        throw new Error("No response from OpenAI");
      }

      const parsedResponse = JSON.parse(responseText);
      return {
        message: parsedResponse.message,
        suggestions: parsedResponse.suggestions || []
      };

    } catch (error) {
      console.error("Error analyzing calculation rule:", error);
      return {
        message: "Error analizando la regla de cálculo.",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  async generateRuleSuggestions(context: {
    specialty?: string;
    participationType?: string;
    serviceType?: string;
  }): Promise<AIResponse> {
    try {
      const prompt = `Basado en el siguiente contexto, sugiere configuraciones apropiadas para una nueva regla de cálculo de honorarios médicos:

Contexto:
- Especialidad: ${context.specialty || 'No especificada'}
- Tipo de Participación: ${context.participationType || 'No especificado'}
- Tipo de Servicio: ${context.serviceType || 'No especificado'}

Responde en formato JSON con:
- message: explicación de las sugerencias
- suggestions: array de configuraciones recomendadas
- considerations: aspectos importantes a considerar`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      const responseText = response.choices[0].message.content;
      if (!responseText) {
        throw new Error("No response from OpenAI");
      }

      const parsedResponse = JSON.parse(responseText);
      return {
        message: parsedResponse.message,
        suggestions: parsedResponse.suggestions || []
      };

    } catch (error) {
      console.error("Error generating rule suggestions:", error);
      return {
        message: "Error generando sugerencias para la regla.",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
}

export const honorariosAgent = new HonorariosMedicosAgent();
