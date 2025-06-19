import { useState, useEffect, useRef } from 'react';
import { FaRobot, FaTimes, FaCarCrash, FaOilCan, FaTools, FaQuestionCircle } from 'react-icons/fa';
import { IoIosSend } from 'react-icons/io';
import styles from './Chatbot.module.scss';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [currentStep, setCurrentStep] = useState('welcome');
  const messagesEndRef = useRef(null);

  // Preguntas frecuentes y respuestas
  const diagnosticFlows = {
    welcome: {
      message: "¡Hola! Soy MecanoBot, tu asistente de diagnóstico mecánico. ¿En qué puedo ayudarte hoy?",
      options: [
        { text: "Problemas comunes", nextStep: "commonProblems" },
        { text: "Cotización rápida", nextStep: "quote" },
        { text: "Horarios de servicio", nextStep: "schedule" }
      ]
    },
    commonProblems: {
      message: "¿Qué tipo de problema tiene tu vehículo?",
      options: [
        { text: "Motor", nextStep: "engine" },
        { text: "Frenos", nextStep: "brakes" },
        { text: "Sonidos extraños", nextStep: "noises" },
        { text: "Problemas eléctricos", nextStep: "electrical" }
      ]
    },
    engine: {
      message: "Problemas de motor:",
      options: [
        { text: "El auto no enciende", response: "Podría ser batería descargada, problemas con el alternador o sistema de encendido. ¿Quieres que te contacte un mecánico?" },
        { text: "Pierde potencia", response: "Puede deberse a filtros de aire/combustible obstruidos, problemas en las bujías o sistema de inyección." },
        { text: "Humo del escape", response: "Humo blanco: posible problema de refrigerante. Humo azul: quema de aceite. Humo negro: mezcla rica de combustible." }
      ]
    },
    brakes: {
      message: "Problemas de frenos:",
      options: [
        { text: "Ruido al frenar", response: "Indica pastillas de freno desgastadas. Deberías revisarlas cuanto antes por seguridad." },
        { text: "Pedido de freno suave", response: "Puede haber aire en las líneas hidráulicas o bajo nivel de líquido de frenos." },
        { text: "Vibración al frenar", response: "Normalmente indica discos de freno deformados por calor. Necesitan rectificado o reemplazo." }
      ]
    },
    schedule: {
      message: "Nuestro horario de atención:",
      response: "📍 Lunes a Viernes: 8:00 AM - 6:00 PM\n📍 Sábados: 9:00 AM - 2:00 PM\n📍 Emergencias 24/7: Llama al 555-1234"
    },
    quote: {
      message: "Para darte una cotización precisa, necesito saber:",
      response: "1. ¿Qué servicio necesitas?\n2. Marca y modelo de tu vehículo\n3. Año de fabricación\n\nPuedes enviarnos estos detalles por aquí o llamarnos directamente."
    }
  };

  const handleOptionSelect = (option) => {
    addMessage(option.text, 'user');
    
    if (option.response) {
      setTimeout(() => {
        addMessage(option.response, 'bot');
      }, 800);
    } else if (option.nextStep) {
      setTimeout(() => {
        const nextStep = diagnosticFlows[option.nextStep];
        addMessage(nextStep.message, 'bot');
        setCurrentStep(option.nextStep);
      }, 800);
    }
  };

  const addMessage = (text, sender) => {
    setMessages(prev => [...prev, { text, sender }]);
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      addMessage(inputValue, 'user');
      setTimeout(() => {
        addMessage("Gracias por tu mensaje. Un asesor humano te contactará pronto.", 'bot');
      }, 1000);
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  // Auto-scroll al final de los mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      {/* Botón flotante */}
      <div 
        className={`${styles.chatbotButton} ${isOpen ? styles.hidden : ''}`}
        onClick={() => setIsOpen(true)}
      >
        <FaRobot className={styles.botIcon} />
        <span>¿Necesitas ayuda?</span>
      </div>

      {/* Chatbot container */}
      <div className={`${styles.chatbotContainer} ${isOpen ? styles.open : ''}`}>
        <div className={styles.chatbotHeader}>
          <div className={styles.botTitle}>
            <FaRobot className={styles.headerIcon} />
            <h3>MecanoBot Asistente</h3>
          </div>
          <button 
            className={styles.closeButton}
            onClick={() => setIsOpen(false)}
          >
            <FaTimes />
          </button>
        </div>

        <div className={styles.chatbotMessages}>
          {messages.length === 0 && (
            <div className={styles.welcomeMessage}>
              <p>¡Hola! Soy tu asistente virtual para diagnóstico mecánico. Selecciona una opción:</p>
              <div className={styles.quickOptions}>
                <button onClick={() => handleOptionSelect({ text: "Problemas de motor", nextStep: "engine" })}>
                  <FaOilCan /> Motor
                </button>
                <button onClick={() => handleOptionSelect({ text: "Problemas de frenos", nextStep: "brakes" })}>
                  <FaCarCrash /> Frenos
                </button>
                <button onClick={() => handleOptionSelect({ text: "Horarios", nextStep: "schedule" })}>
                  <FaTools /> Horarios
                </button>
              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`${styles.message} ${msg.sender === 'user' ? styles.userMessage : styles.botMessage}`}
            >
              {msg.text.split('\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {currentStep in diagnosticFlows && diagnosticFlows[currentStep].options && (
          <div className={styles.chatbotOptions}>
            {diagnosticFlows[currentStep].options.map((option, index) => (
              <button
                key={index}
                className={styles.optionButton}
                onClick={() => handleOptionSelect(option)}
              >
                {option.text}
              </button>
            ))}
          </div>
        )}

        <div className={styles.chatbotInput}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu pregunta..."
          />
          <button 
            className={styles.sendButton}
            onClick={handleSendMessage}
          >
            <IoIosSend />
          </button>
        </div>
      </div>
    </>
  );
};

export default Chatbot;