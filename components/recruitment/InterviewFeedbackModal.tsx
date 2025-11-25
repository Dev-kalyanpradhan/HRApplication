
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { InterviewResult } from '../../types';

interface InterviewFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: string, result: InterviewResult) => void;
}

const InterviewFeedbackModal: React.FC<InterviewFeedbackModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [feedback, setFeedback] = useState('');
  const [result, setResult] = useState<InterviewResult | ''>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback || !result) {
      alert("Please provide both feedback and a result.");
      return;
    }
    onSubmit(feedback, result);
    // Reset form for next time
    setFeedback('');
    setResult('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Interview Feedback">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="feedback" className="block text-sm font-medium text-slate-700 mb-1">
            Feedback & Comments
          </label>
          <textarea
            id="feedback"
            name="feedback"
            rows={5}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Provide your detailed assessment of the candidate..."
            required
          />
        </div>
        <Select id="result" label="Interview Result" value={result} onChange={(e) => setResult(e.target.value as InterviewResult)} required>
          <option value="" disabled>Select a result</option>
          {Object.values(InterviewResult).map(res => (
            <option key={res} value={res}>{res}</option>
          ))}
        </Select>
        <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">Submit Feedback</Button>
        </div>
      </form>
    </Modal>
  );
};

export default InterviewFeedbackModal;
