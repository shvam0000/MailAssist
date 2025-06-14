'use client';

import { useState } from 'react';
import { ChevronDownIcon } from '../../../utils/icons';

interface EmailData {
  subject: string;
  body: string;
  sender: string;
  recipients?: string[];
  recipient?: string;
  timestamp: string;
}

interface EmailAccordionProps {
  email: EmailData;
  formatDate: (date: string) => string;
}

const EmailAccordion: React.FC<EmailAccordionProps> = ({
  email,
  formatDate,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleAccordion = () => setIsOpen((prev) => !prev);

  const recipients = Array.isArray(email.recipients)
    ? email.recipients
    : email.recipient
    ? [email.recipient]
    : [];

  return (
    <div
      className="border border-gray-200 m-4 rounded-lg p-4 bg-white shadow-sm cursor-pointer transition-all"
      onClick={toggleAccordion}>
      <div className="flex justify-between items-start">
        <p className="font-semibold text-sm sm:text-base text-gray-800">
          Subject: {email.subject} –{' '}
          {email.sender
            .split('@')[0]
            .replace('.', ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase())}
        </p>
        <div
          className={`transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}>
          <ChevronDownIcon />
        </div>
      </div>

      {isOpen && (
        <div className="text-sm text-gray-600 mt-2 space-y-1 overflow-y-auto max-h-[300px]">
          <p>
            <span className="text-gray-500">Recipients:</span>{' '}
            <span className="text-blue-500">
              {recipients.length > 0 ? recipients.join(', ') : 'No recipients'}
            </span>
          </p>
          <p>
            <span className="text-gray-500">Timestamp:</span>{' '}
            <span className="text-blue-500">{formatDate(email.timestamp)}</span>
          </p>
          <p className="mt-3 font-normal">
            {email.body.replace(/<[^>]+>/g, '').slice(0, 200)}
          </p>
        </div>
      )}
    </div>
  );
};

export default EmailAccordion;
