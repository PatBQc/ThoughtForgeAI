interface Message {
    role: string;
    content: string;
  }
  
  export const formatConversationToHTML = (conversation: Message[], subject: string): string => {
    let html = `<h1>${subject}</h1>`;
    
    conversation.forEach((message, index) => {
      const role = message.role === 'user' ? 'You' : 'AI';
      html += `<p><strong>${role}:</strong> ${message.content}</p>`;
      if (index < conversation.length - 1) {
        html += '<hr>';
      }
    });
    
    return html;
  };