import React, { useState, useEffect } from 'react';
import RichTextEditor from 'reactjs-tiptap-editor';
import { BaseKit } from 'reactjs-tiptap-editor';
import { Bold } from 'reactjs-tiptap-editor/bold';
import { Italic } from 'reactjs-tiptap-editor/italic';
import { TextUnderline as Underline } from 'reactjs-tiptap-editor/textunderline';
import { Strike } from 'reactjs-tiptap-editor/strike';
import { BulletList } from 'reactjs-tiptap-editor/bulletlist';
import { OrderedList } from 'reactjs-tiptap-editor/orderedlist';
import { Heading } from 'reactjs-tiptap-editor/heading';
import { Link } from 'reactjs-tiptap-editor/link';
import { Label } from '@/components/ui/label';
import styles from './RichTextEditor.module.css';

// Import the editor CSS but we'll override problematic styles
import 'reactjs-tiptap-editor/style.css';

interface RichTextBlockProps {
  data: {
    content: string;
    language: 'eng' | 'lud';
  };
  onChange: (data: Partial<RichTextBlockProps['data']>) => void;
  language?: 'eng' | 'lud';
}

const RichTextBlock: React.FC<RichTextBlockProps> = ({ data, onChange, language }) => {
  const displayLanguage = language || data.language || 'eng';
  const [content, setContent] = useState(data.content || '');

  // Configure extensions with BaseKit and formatting tools
  const extensions = [
    BaseKit.configure({
      placeholder: {
        showOnlyCurrent: true,
        placeholder: `Enter your ${displayLanguage === 'lud' ? 'Lisan ud-Dawat' : 'English'} text here...`,
      },
      characterCount: {
        limit: 50_000,
      },
    }),
    Bold,
    Italic,
    Underline,
    Strike,
    BulletList,
    OrderedList,
    Heading,
    Link,
  ];

  console.log('Extensions configured:', extensions);
  console.log('BaseKit:', BaseKit);
  
  // Debug: Check if toolbar elements exist in DOM
  useEffect(() => {
    const checkToolbar = () => {
      const toolbar = document.querySelector('.tiptap-editor-toolbar, [data-testid="toolbar"], .ProseMirror-menubar, .editor-toolbar');
      console.log('Toolbar element found:', toolbar);
      if (toolbar) {
        console.log('Toolbar styles:', window.getComputedStyle(toolbar));
      }
    };
    
    // Check after a short delay to allow rendering
    setTimeout(checkToolbar, 1000);
  }, []);

  // Handle content changes
  const onChangeContent = (value: string) => {
    setContent(value);
    onChange({ content: value });
  };

  // Update local content when data.content changes
  useEffect(() => {
    setContent(data.content || '');
  }, [data.content]);

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">
        {displayLanguage === 'lud' ? 'Lisan ud-Dawat Text' : 'English Text'}
      </Label>
      <div 
        className={`min-h-[200px] border border-gray-200 ${styles.richTextEditorWrapper} ${displayLanguage === 'lud' ? 'font-kanz' : ''}`}
        dir={displayLanguage === 'lud' ? 'rtl' : 'ltr'}
      >
        <RichTextEditor
          output="html"
          content={content}
          onChangeContent={onChangeContent}
          extensions={extensions}
          minHeight="200px"
          contentClass={displayLanguage === 'lud' ? 'text-right font-kanz' : 'text-left'}
          dark={false}
          hideToolbar={false}
          disableBubble={false}
          hideBubble={false}
        />
      </div>
    </div>
  );
};

export default RichTextBlock;