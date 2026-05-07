import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, CheckCircle, Radio, WifiOff } from 'lucide-react';

interface ShareModalProps {
  roomId: string;
  onClose: () => void;
  onStop: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ roomId, onClose, onStop }) => {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/watch/${roomId}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Radio size={18} className="text-green-500" />
            <h2 className="text-lg font-bold text-gray-800">Share Scoreboard</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-5">
          Scan to follow the live score — viewers can't make changes.
        </p>

        <div className="flex justify-center mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <QRCodeSVG value={url} size={180} />
        </div>

        <button
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors font-medium"
        >
          {copied
            ? <><CheckCircle size={15} className="text-green-500" /> Copied!</>
            : <><Copy size={15} /> Copy link</>
          }
        </button>

        <button
          onClick={onStop}
          className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors font-medium"
        >
          <WifiOff size={15} />
          Stop sharing
        </button>
      </div>
    </div>
  );
};

export default ShareModal;
