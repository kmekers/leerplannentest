import { GiGoat, GiFox } from 'react-icons/gi';
import { FaFemale } from 'react-icons/fa';

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
      id: 'reynaerde', 
      name: 'Reynaerde', 
      icon: GiFox,
      description: '7b model trained by Rebatch' 
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
      description: 'Comprehensive PDF analysis and understanding' 
    }
  ]
}; 