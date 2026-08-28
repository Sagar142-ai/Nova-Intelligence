import React, { useState, useRef } from 'react';
import {
  Send,
  Volume2,
  Copy,
  Check,
  Sparkles,
  User,
  Wrench,
  Activity,
  Trash2,
  Mic,
  Image as ImageIcon,
  X,
  Download,
  Eye,
  FileCode,
} from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatTimelineProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, imageBase64?: string, imageMimeType?: string) => void;
  onReplayAudio: (text: string) => void;
  onClearChat: () => void;
  onToggleMic: () => void;
  isListening: boolean;
  isProcessing: boolean;
}

export const ChatTimeline: React.FC<ChatTimelineProps> = ({
  messages,
  onSendMessage,
  onReplayAudio,
  onClearChat,
  onToggleMic,
  isListening,
  isProcessing,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [attachedImage, setAttachedImage] = useState<{ base64: string; mimeType: string; preview: string } | null>(null);
  const [previewModalImg, setPreviewModalImg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !attachedImage) || isProcessing) return;
    onSendMessage(inputText.trim(), attachedImage?.base64, attachedImage?.mimeType);
    setInputText('');
    setAttachedImage(null);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file);
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPEG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      setAttachedImage({
        base64,
        mimeType: file.type,
        preview: dataUrl,
      });
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          processImageFile(file);
          break;
        }
      }
    }
  };

  const starterPrompts = [
    { label: '🧠 Explain Quantum Computing', query: 'Explain the fundamental principles of quantum computing and how qubits differ from classical bits.' },
    { label: '🐍 Python Algorithm', query: 'Write a Python script to find all prime numbers up to N with Sieve of Eratosthenes and explain time complexity.' },
    { label: '🎨 Generate AI Artwork', query: 'Generate an image of a futuristic holographic neural network interface in cybernetic neon colors.' },
    { label: '📐 Solve Math Equation', query: 'Solve the system of equations: 3x + 2y = 18 and 5x - y = 4 with step by step derivation.' },
  ];

  return (
    <div
      onPaste={handlePaste}
      className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
    >
      {/* Top Conversation Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Multimodal Intelligence Stream ({messages.length} messages)
          </h2>
        </div>
        {messages.length > 0 && (
          <button
            id="btn-clear-chat"
            onClick={onClearChat}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-400 px-2 py-1 rounded hover:bg-slate-800 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Chat
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 text-slate-400">
            <div className="w-14 h-14 rounded-2xl bg-cyan-950/60 border border-cyan-800 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-200">Ask Any Question to Nova AI</h3>
              <p className="text-xs text-slate-400 max-w-md mt-1">
                Upload images for visual diagnosis, request code or math solutions, generate artwork, or ask complex domain questions.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full pt-2">
              {starterPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(p.query)}
                  className="text-left text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 p-2.5 rounded-xl text-slate-300 hover:text-cyan-300 transition-all shadow-sm"
                >
                  <span className="font-medium">{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[90%] sm:max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isUser
                    ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white'
                    : 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              {/* Message Bubble Card */}
              <div
                className={`rounded-2xl p-4 shadow-md transition-all ${
                  isUser
                    ? 'bg-cyan-950/80 border border-cyan-800/80 text-cyan-100'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-100'
                }`}
              >
                {/* Assistant Metadata Badges */}
                {!isUser && msg.telemetry && (
                  <div className="flex flex-wrap items-center gap-1.5 mb-2 pb-2 border-b border-slate-800 text-[10px]">
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono capitalize">
                      <Activity className="w-2.5 h-2.5" />
                      Intent: {msg.telemetry.intent.replace(/_/g, ' ')}
                    </span>
                    {msg.telemetry.toolUsed && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 font-mono">
                        <Wrench className="w-2.5 h-2.5" />
                        Tool: {msg.telemetry.toolUsed}
                      </span>
                    )}
                    <span className="text-slate-500 font-mono ml-auto">
                      {msg.telemetry.latency.totalMs} ms
                    </span>
                  </div>
                )}

                {/* Render Attached Image if user sent one */}
                {msg.imageUrl && (
                  <div className="mb-3 rounded-xl overflow-hidden border border-slate-700/80 relative group max-w-sm">
                    <img
                      src={msg.imageUrl}
                      alt="User Attachment"
                      className="w-full h-auto max-h-60 object-contain bg-black/40"
                    />
                    <button
                      onClick={() => setPreviewModalImg(msg.imageUrl || null)}
                      className="absolute bottom-2 right-2 bg-black/70 hover:bg-black text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      title="View full image"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Render Generated Artwork / Image if assistant generated one */}
                {msg.generatedImageUrl && (
                  <div className="mb-3 rounded-xl overflow-hidden border border-purple-700/60 relative group bg-black/50">
                    <img
                      src={msg.generatedImageUrl}
                      alt="Generated Artwork"
                      className="w-full h-auto max-h-80 object-contain"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a
                        href={msg.generatedImageUrl}
                        download={`nova-ai-generation-${Date.now()}.png`}
                        className="bg-black/80 hover:bg-purple-600 text-white p-1.5 rounded-lg transition-colors"
                        title="Download image"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => setPreviewModalImg(msg.generatedImageUrl || null)}
                        className="bg-black/80 hover:bg-purple-600 text-white p-1.5 rounded-lg transition-colors"
                        title="View full size"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Message Text Content */}
                <div className="text-sm whitespace-pre-wrap leading-relaxed space-y-2 font-normal">
                  {msg.content}
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-800/60 text-xs text-slate-500">
                  <span className="text-[10px]">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      title="Copy message text"
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    {!isUser && (
                      <button
                        onClick={() => onReplayAudio(msg.content)}
                        title="Replay TTS Voice"
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {isProcessing && (
          <div className="flex gap-3 max-w-[80%] mr-auto animate-pulse">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/50 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="rounded-2xl p-3.5 bg-slate-900 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              Nova AI is reasoning and executing model analysis...
            </div>
          </div>
        )}
      </div>

      {/* Attached Image Preview Bar */}
      {attachedImage && (
        <div className="px-3 py-2 bg-slate-950/90 border-t border-slate-800 flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-cyan-500/60 bg-black shrink-0">
            <img src={attachedImage.preview} alt="Attached thumbnail" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => setAttachedImage(null)}
              className="absolute top-0.5 right-0.5 bg-rose-600 text-white rounded-full p-0.5 hover:bg-rose-500"
              title="Remove image"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
          <div className="text-xs text-slate-300 flex-1 truncate">
            <span className="text-cyan-400 font-semibold">Image Attached:</span> Ready for visual analysis & questioning
          </div>
        </div>
      )}

      {/* Manual Input Footer */}
      <form onSubmit={handleSubmit} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageSelect}
          accept="image/*"
          className="hidden"
          id="chat-file-input"
        />

        {/* Upload Image Button */}
        <button
          type="button"
          id="btn-chat-upload-img"
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 rounded-xl border bg-slate-900 text-slate-400 border-slate-800 hover:text-cyan-400 hover:border-cyan-500/50 transition-all"
          title="Upload or paste image for vision analysis"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        {/* Microphone Button */}
        <button
          type="button"
          id="btn-chat-mic"
          onClick={onToggleMic}
          className={`p-2.5 rounded-xl border transition-all ${
            isListening
              ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-cyan-400 hover:border-cyan-500/50'
          }`}
          title={isListening ? 'Stop listening' : 'Start microphone input'}
        >
          <Mic className="w-4 h-4" />
        </button>

        <input
          id="input-chat-query"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={attachedImage ? 'Ask any question about the attached image...' : 'Ask Nova a question, request code, math solutions, or generate images...'}
          className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
        />

        <button
          type="submit"
          id="btn-chat-send"
          disabled={(!inputText.trim() && !attachedImage) || isProcessing}
          className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-cyan-500/20 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Full Resolution Image Lightbox Modal */}
      {previewModalImg && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreviewModalImg(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewModalImg(null)}
              className="absolute -top-10 right-0 text-white hover:text-rose-400 p-2"
              title="Close viewer"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={previewModalImg} alt="Preview" className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};
