import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useAuth } from '../../contexts/AuthContext';

interface AddAnnouncementModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AddAnnouncementModal: React.FC<AddAnnouncementModalProps> = ({ isOpen, onClose }) => {
    const { addAnnouncement } = useAuth();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;
        addAnnouncement(title, content);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Announcement">
            <form onSubmit={handleSubmit} className="space-y-6">
                <Input 
                    id="title" 
                    label="Title" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)}
                    required
                />
                <div>
                    <label htmlFor="content" className="block text-sm font-medium text-slate-700 mb-1">
                        Content
                    </label>
                    <textarea
                        id="content"
                        rows={8}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Write the announcement details here. You can use newlines for paragraphs."
                        required
                    />
                </div>
                <div className="flex justify-end gap-4 pt-4 border-t">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Publish Announcement</Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddAnnouncementModal;
