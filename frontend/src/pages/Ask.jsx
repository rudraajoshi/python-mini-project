import { useCallback, useEffect, useRef, useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { PanelLeft } from 'lucide-react';
import PageTransition from '../components/app/PageTransition.jsx';
import ChatMessage from '../components/chat/ChatMessage.jsx';
import ChatInput from '../components/chat/ChatInput.jsx';
import ChatHistory from '../components/chat/ChatHistory.jsx';
import RenameDialog from '../components/documents/RenameDialog.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import IconButton from '../components/ui/IconButton.jsx';
import { ask, createChat, deleteChat, getChat, listChats, renameChat } from '../api/chatApi.js';
import { useAsync } from '../hooks/useAsync.js';
import { useToast } from '../context/ToastContext.jsx';
import { useMediaQuery } from '../hooks/useMediaQuery.js';

const starters = [
  'What is 2NF?',
  'Explain circular queue.',
  'Difference between primary key and candidate key?',
  'Explain SVD in image compression.',
];

export default function Ask() {
  const { collections } = useOutletContext();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const chatsState = useAsync(() => listChats(), []);
  const chats = chatsState.data?.results ?? [];

  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [scope, setScope] = useState({ type: 'all' });
  const [thinking, setThinking] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [renaming, setRenaming] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, thinking]);

  const openChat = useCallback(
    async (id) => {
      setActiveId(id);
      setHistoryOpen(false);
      try {
        const chat = await getChat(id);
        setMessages(chat.messages);
        setScope(chat.scope ?? { type: 'all' });
      } catch (error) {
        toast.error('Could not open conversation', error.message);
      }
    },
    [toast]
  );

  useEffect(() => {
    const documentId = searchParams.get('document');
    if (documentId) setScope({ type: 'documents', ids: [documentId], label: 'This document' });
  }, [searchParams]);

  async function handleNewChat() {
    setActiveId(null);
    setMessages([]);
    setHistoryOpen(false);
  }

  async function handleSend(question) {
    const userMessage = { id: `m_${Date.now()}`, role: 'user', content: question, at: new Date().toISOString() };
    setMessages((current) => [...current, userMessage]);
    setThinking(true);

    let chatId = activeId;
    try {
      if (!chatId) {
        const chat = await createChat(scope);
        chatId = chat.id;
        setActiveId(chat.id);
        renameChat(chat.id, question.slice(0, 42)).then(() => chatsState.run().catch(() => {}));
      }

      const response = await ask({ question, chatId, scope });
      setMessages((current) => [
        ...current,
        {
          id: `m_${Date.now() + 1}`,
          role: 'assistant',
          content: response.answer,
          sources: response.sources ?? [],
          at: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      toast.error('Answer failed', error.message);
      setMessages((current) => current.filter((m) => m.id !== userMessage.id));
    } finally {
      setThinking(false);
    }
  }

  const historyPanel = (
    <ChatHistory
      chats={chats}
      activeId={activeId}
      onSelect={openChat}
      onNew={handleNewChat}
      onRename={setRenaming}
      onDelete={setDeleting}
    />
  );

  return (
    <PageTransition className="mx-auto flex h-[calc(100vh-56px)] w-full max-w-6xl gap-8 px-5 py-6 sm:px-8 lg:h-screen lg:py-10">
      {isDesktop && (
        <aside className="w-[196px] shrink-0 border-r border-line pr-5">{historyPanel}</aside>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="mb-5 flex items-start gap-3">
          {!isDesktop && (
            <IconButton icon={PanelLeft} label="Conversations" onClick={() => setHistoryOpen((o) => !o)} />
          )}
          <div>
            <h1 className="text-section font-semibold tracking-[-0.018em] text-ink">Ask your knowledge</h1>
            <p className="mt-1 text-base text-muted">Answers are grounded in the documents you’ve saved.</p>
          </div>
        </header>

        {!isDesktop && historyOpen && (
          <div className="mb-5 max-h-56 rounded-lg border border-line bg-surface p-3">{historyPanel}</div>
        )}

        <div className="scrollarea min-h-0 flex-1 overflow-y-auto pr-1">
          {messages.length === 0 && !thinking ? (
            <div className="flex h-full flex-col justify-center py-8">
              <p className="mb-3 text-meta font-medium text-muted">Start with</p>
              <ul className="space-y-1.5">
                {starters.map((starter) => (
                  <li key={starter}>
                    <button
                      type="button"
                      onClick={() => handleSend(starter)}
                      className="-mx-2 w-full rounded-md px-2 py-2 text-left text-reading text-ink-soft transition-colors duration-150 hover:bg-raised hover:text-ink"
                    >
                      {starter}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="space-y-7 py-2">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {thinking && <ChatMessage message={{ role: 'assistant' }} pending />}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <div className="pt-4">
          <ChatInput
            onSend={handleSend}
            scope={scope}
            onScopeChange={setScope}
            collections={collections}
            disabled={thinking}
          />
        </div>
      </div>

      <RenameDialog
        open={Boolean(renaming)}
        onClose={() => setRenaming(null)}
        initialValue={renaming?.title ?? ''}
        label="Conversation name"
        onSubmit={async (title) => {
          await renameChat(renaming.id, title);
          chatsState.run();
        }}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title={`Delete “${deleting?.title ?? ''}”?`}
        description="The conversation and its answers are removed. Your documents are not affected."
        confirmLabel="Delete conversation"
        onConfirm={async () => {
          await deleteChat(deleting.id);
          if (deleting.id === activeId) handleNewChat();
          chatsState.run();
          toast.success('Conversation deleted');
        }}
      />
    </PageTransition>
  );
}
