import { marked } from 'marked';

interface Message {
  role: string;
  content: string;
}

// Configuration de marked pour produire un HTML minimal
marked.setOptions({
  headerIds: false,
  mangle: false,
  headerPrefix: '',
  gfm: true,
  breaks: true,
});

export const formatConversationToHTML = (conversation: Message[], subject: string): string => {
  let html = '';

  conversation.forEach((message) => {
    const role = message.role === 'user' ? '💬 You' : '🤖 AI';
    html += `<h2>${role}</h2>`;

    // Utiliser marked pour convertir le contenu en HTML
    let formattedContent: string = marked(message.content) as string;

    html += formattedContent;

    html += '<br /><br />';
  });

  console.log('--ThoughtForgeAI-- html to export: ' + html);

  return html;
};
