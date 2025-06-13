'use client';
import { useEffect, useState } from 'react';
import { SearchIcon } from '../../utils/icons';
import EmailAccordion from './components/mail-accordian';

const HomePage = () => {
  const [emails, setEmails] = useState([]);

  useEffect(() => {
    const fetchEmails = async () => {
      const response = await fetch('http://127.0.0.1:5000/fetch-emails');
      const data = await response.json();
      setEmails(data);
    };
    fetchEmails();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center p-10">
        <h1 className="text-xl font-bold">MailAssist</h1>
        <div className="relative w-full max-w-xs">
          <div className="absolute inset-y-0 left-1 flex items-center pointer-events-none">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-100 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>
      </div>
      <div className="px-32">
        <div>
          <h1 className="text-3xl font-bold ">Forwarded Emails</h1>
          <div className="relative w-full max-w-lg mt-4 ml-5 border border-gray-300 rounded-xl">
            <div className="absolute inset-y-0 left-1 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search emails"
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-100 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
        </div>
        <div>
          {emails.map((email, index) => (
            <EmailAccordion key={index} email={email} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
