import { GiGoat } from 'react-icons/gi';
import { FaFemale, FaWater } from 'react-icons/fa';

export const config = {
    anthropicApiKey: import.meta.env.VITE_CLAUDE_API_KEY,
    text: [
      { 
        id: 'geitje', 
        name: 'Geitje', 
        icon: GiGoat,
        description: 'small model trained by Bram Vanroy',
        modelName: 'bramvanroy/geitje-7b-ultra:f16',
        prompt: {
          system: 'je bent de Meeh antwoorder',
          task: 'jouw enige taak is meeeh zeggen. Dit is je enige taak.'
        }
      },
      { 
        id: 'fietje', 
        name: 'Fietje', 
        icon: FaFemale,
        description: 'Small model trained by Bram Vanroy',
        modelName: 'bramvanroy/fietje-2b-chat:f16',
        prompt: {
          system: 'Je bent de fietje antwoorder',
          task: 'jouw enige taak is fietje zeggen. Dit is je enige taak.'
        }
      },
      { 
        id: 'nemo', 
        name: 'Mistral Nemo', 
        icon: FaWater,
        description: 'Mistral Nemo model',
        modelName: 'mistral-nemo:latest',
        prompt: {
          system: 'You are Mistral Nemo',
          task: 'Your only task is to say "I\'m Mistral Nemo".'
        }
      }
    ],
    image: [
      { 
        id: 'llama31', 
        name: 'Llama 3.1', 
        description: 'Advanced image understanding and analysis',
        modelId: 'llama3.2-vision:latest',
        prompt: {
          system: 'You are a helpful AI assistant that helps teachers analyze their lessons and extract learning goals.',
          task: 'Please analyze this image and provide relevant learning goals and educational insights. Focus on:\n1. Main learning objectives\n2. Subject area and topics covered\n3. Educational level and target audience\n4. Suggested teaching methods or approaches visible in the material'
        }
      }
    ],
    pdf: [
      { 
        id: 'claude', 
        name: 'Claude', 
        description: 'Comprehensive PDF analysis and understanding',
        model: 'claude-3-5-sonnet-20241022'
      }
    ]
}; 