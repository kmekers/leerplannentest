import { GiGoat } from 'react-icons/gi';
import { FaFemale, FaWater } from 'react-icons/fa';

export const config = {
    anthropicApiKey: process.env.REACT_APP_ANTHROPIC_API_KEY,
    // ... other config options
};

export const models = {
  text: [
    { 
      id: 'geitje', 
      name: 'Geitje', 
      icon: GiGoat,
      description: 'small model trained by Bram Vanroy' 
    },
    { 
      id: 'fietje', 
      name: 'Fietje', 
      icon: FaFemale,
      description: 'Small model trained by Bram Vanroy' 
    },
    { 
      id: 'nemo', 
      name: 'Mistral Nemo', 
      icon: FaWater,
      description: 'Mistral Nemo model' 
    }
  ],
  image: [
    { 
      id: 'llama31', 
      name: 'Llama 3.1', 
      description: 'Advanced image understanding and analysis',
      modelId: 'llama3.2-vision:latest'
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

export const prompts = {
  llama31: {
    system: 'You are a helpful AI assistant that helps teachers analyze their lessons and extract learning goals.',
    task: 'Please analyze this image and provide relevant learning goals and educational insights. Focus on:\n1. Main learning objectives\n2. Subject area and topics covered\n3. Educational level and target audience\n4. Suggested teaching methods or approaches visible in the material'
  },
  testgeitje: {
    system: 'je bent de Meeh antwoorder ',
    task: 'jouw enige taak is meeeh zeggen. Dit is je enige taak.'
  },
  testfietje: {
    system: 'Je bent de fietje antwoorder',
    task: 'jouw enige taak is fietje zeggen. Dit is je enige taak.'
  },
  testnemo: {
    system: 'You are Mistral Nemo',
    task: 'Your only task is to say "I\'m Mistral Nemo".'
  }
}; 