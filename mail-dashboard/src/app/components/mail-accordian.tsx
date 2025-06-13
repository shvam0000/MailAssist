'use client';

import { useState } from 'react';
import { ChevronDownIcon } from '../../../utils/icons';

interface EmailData {
  subject: string;
  body: string;
  sender: string;
  recipients: string[];
  receivedAt: string;
}

interface EmailAccordionProps {
  email: EmailData;
}

const EmailAccordion: React.FC<EmailAccordionProps> = ({ email }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleAccordion = () => setIsOpen((prev) => !prev);

  const formattedDate = new Date(email.receivedAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

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
        <div className="text-sm text-gray-600 mt-2 space-y-1">
          <p>
            <span className="text-gray-500">Recipients:</span>{' '}
            <span className="text-blue-500">{email.recipients.join(', ')}</span>
          </p>
          <p>
            <span className="text-gray-500">Received Date:</span>{' '}
            <span className="text-blue-500">{formattedDate}</span>
          </p>
          <p className="mt-3 font-normal">{email.body}</p>
        </div>
      )}
    </div>
  );
};

export default EmailAccordion;
