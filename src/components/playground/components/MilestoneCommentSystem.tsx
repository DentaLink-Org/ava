import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Reply, 
  Edit3, 
  Trash2, 
  Heart, 
  AtSign, 
  Paperclip, 
  Image, 
  Smile, 
  MoreVertical,
  Eye,
  EyeOff,
  Pin,
  Flag,
  Clock,
  Check,
  X
} from 'lucide-react';
import type { 
  Milestone, 
  TeamMember 
} from '../../milestones/types';

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  author: TeamMember;
  milestoneId: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  isDeleted: boolean;
  isPinned: boolean;
  isFlagged: boolean;
  reactions: CommentReaction[];
  attachments: CommentAttachment[];
  mentions: string[];
  replies: Comment[];
  visibility: CommentVisibility;
  moderationStatus: ModerationStatus;
}

export interface CommentReaction {
  id: string;
  type: ReactionType;
  userId: string;
  user: TeamMember;
  createdAt: string;
}

export interface CommentAttachment {
  id: string;
  name: string;
  url: string;
  type: AttachmentType;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
}

export interface CommentMention {
  id: string;
  userId: string;
  user: TeamMember;
  position: number;
  length: number;
}

export interface CommentDraft {
  id: string;
  content: string;
  milestoneId: string;
  parentId?: string;
  updatedAt: string;
  mentions: CommentMention[];
  attachments: CommentAttachment[];
}

export interface CommentFilter {
  authorId?: string;
  dateFrom?: string;
  dateTo?: string;
  hasAttachments?: boolean;
  isPinned?: boolean;
  visibility?: CommentVisibility;
  search?: string;
}

export interface CommentPreferences {
  showReactions: boolean;
  showTimestamps: boolean;
  showAvatars: boolean;
  enableMentions: boolean;
  enableRichText: boolean;
  enableAttachments: boolean;
  autoSaveDrafts: boolean;
  notificationSettings: CommentNotificationSettings;
}

export interface CommentNotificationSettings {
  onMention: boolean;
  onReply: boolean;
  onReaction: boolean;
  onPin: boolean;
  onFlag: boolean;
}

export type ReactionType = 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';
export type AttachmentType = 'image' | 'document' | 'video' | 'audio' | 'other';
export type CommentVisibility = 'public' | 'team' | 'private';
export type ModerationStatus = 'approved' | 'pending' | 'rejected' | 'flagged';
export type SortBy = 'newest' | 'oldest' | 'most-liked' | 'most-replies';

export interface MilestoneCommentSystemProps {
  milestone: Milestone;
  comments: Comment[];
  currentUser: TeamMember;
  teamMembers: TeamMember[];
  onCommentCreate: (content: string, parentId?: string, attachments?: CommentAttachment[]) => Promise<void>;
  onCommentUpdate: (commentId: string, content: string) => Promise<void>;
  onCommentDelete: (commentId: string) => Promise<void>;
  onCommentPin: (commentId: string) => Promise<void>;
  onCommentFlag: (commentId: string, reason: string) => Promise<void>;
  onReactionAdd: (commentId: string, type: ReactionType) => Promise<void>;
  onReactionRemove: (commentId: string, type: ReactionType) => Promise<void>;
  onAttachmentUpload: (file: File) => Promise<CommentAttachment>;
  onMentionSearch: (query: string) => Promise<TeamMember[]>;
  enableModeration?: boolean;
  enableAttachments?: boolean;
  enableMentions?: boolean;
  enableRichText?: boolean;
  maxAttachmentSize?: number;
  allowedFileTypes?: string[];
  className?: string;
}

export const MilestoneCommentSystem: React.FC<MilestoneCommentSystemProps> = ({
  milestone,
  comments,
  currentUser,
  teamMembers,
  onCommentCreate,
  onCommentUpdate,
  onCommentDelete,
  onCommentPin,
  onCommentFlag,
  onReactionAdd,
  onReactionRemove,
  onAttachmentUpload,
  onMentionSearch,
  enableModeration = true,
  enableAttachments = true,
  enableMentions = true,
  enableRichText = true,
  maxAttachmentSize = 10 * 1024 * 1024, // 10MB
  allowedFileTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.txt'],
  className = ''
}) => {
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [filter, setFilter] = useState<CommentFilter>({});
  const [showAttachments, setShowAttachments] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mentionSuggestions, setMentionSuggestions] = useState<TeamMember[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sort and filter comments
  const processedComments = comments
    .filter(comment => {
      if (filter.authorId && comment.authorId !== filter.authorId) return false;
      if (filter.isPinned && !comment.isPinned) return false;
      if (filter.hasAttachments && comment.attachments.length === 0) return false;
      if (filter.visibility && comment.visibility !== filter.visibility) return false;
      if (filter.search) {
        const query = filter.search.toLowerCase();
        return comment.content.toLowerCase().includes(query) || 
               comment.author.name.toLowerCase().includes(query);
      }
      return !comment.isDeleted && !comment.parentId; // Only show top-level comments
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'most-liked':
          return b.reactions.filter(r => r.type === 'like').length - a.reactions.filter(r => r.type === 'like').length;
        case 'most-replies':
          return b.replies.length - a.replies.length;
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const handleCommentSubmit = useCallback(async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      await onCommentCreate(newComment, replyTo || undefined);
      setNewComment('');
      setReplyTo(null);
      setShowAttachments(false);
    } catch (error) {
      console.error('Failed to create comment:', error);
    } finally {
      setLoading(false);
    }
  }, [newComment, replyTo, onCommentCreate]);

  const handleEditSubmit = useCallback(async (commentId: string) => {
    if (!editContent.trim()) return;

    setLoading(true);
    try {
      await onCommentUpdate(commentId, editContent);
      setEditingComment(null);
      setEditContent('');
    } catch (error) {
      console.error('Failed to update comment:', error);
    } finally {
      setLoading(false);
    }
  }, [editContent, onCommentUpdate]);

  const handleReaction = useCallback(async (commentId: string, type: ReactionType) => {
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    const existingReaction = comment.reactions.find(r => r.userId === currentUser.id && r.type === type);
    
    if (existingReaction) {
      await onReactionRemove(commentId, type);
    } else {
      await onReactionAdd(commentId, type);
    }
  }, [comments, currentUser.id, onReactionAdd, onReactionRemove]);

  const handleMentionSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setMentionSuggestions([]);
      return;
    }

    try {
      const suggestions = await onMentionSearch(query);
      setMentionSuggestions(suggestions);
    } catch (error) {
      console.error('Failed to search mentions:', error);
    }
  }, [onMentionSearch]);

  const handleFileUpload = useCallback(async (file: File) => {
    if (file.size > maxAttachmentSize) {
      alert(`File size exceeds ${maxAttachmentSize / (1024 * 1024)}MB limit`);
      return;
    }

    setUploading(true);
    try {
      const attachment = await onAttachmentUpload(file);
      // Handle attachment addition logic here
      console.log('Attachment uploaded:', attachment);
    } catch (error) {
      console.error('Failed to upload attachment:', error);
    } finally {
      setUploading(false);
    }
  }, [maxAttachmentSize, onAttachmentUpload]);

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInSeconds = (now.getTime() - commentDate.getTime()) / 1000;

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return commentDate.toLocaleDateString();
  };

  const renderReactions = (comment: Comment) => {
    const reactionCounts = comment.reactions.reduce((acc, reaction) => {
      acc[reaction.type] = (acc[reaction.type] || 0) + 1;
      return acc;
    }, {} as Record<ReactionType, number>);

    const reactionEmojis: Record<ReactionType, string> = {
      like: '👍',
      love: '❤️',
      laugh: '😂',
      wow: '😮',
      sad: '😢',
      angry: '😠'
    };

    return (
      <div className="flex items-center space-x-2 mt-2">
        {Object.entries(reactionCounts).map(([type, count]) => (
          <button
            key={type}
            onClick={() => handleReaction(comment.id, type as ReactionType)}
            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-sm hover:bg-gray-100 ${
              comment.reactions.some(r => r.userId === currentUser.id && r.type === type)
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600'
            }`}
          >
            <span>{reactionEmojis[type as ReactionType]}</span>
            <span>{count}</span>
          </button>
        ))}
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        >
          <Smile size={16} />
        </button>
      </div>
    );
  };

  const renderComment = (comment: Comment) => (
    <div key={comment.id} className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-sm font-semibold text-gray-700">
              {comment.author.name[0].toUpperCase()}
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-gray-900">{comment.author.name}</span>
              <span className="text-sm text-gray-500">{comment.author.role}</span>
              {comment.isPinned && (
                <Pin size={14} className="text-blue-600" />
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{formatTimeAgo(comment.createdAt)}</span>
              {comment.isEdited && <span>(edited)</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setReplyTo(comment.id)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <Reply size={16} />
          </button>
          {comment.authorId === currentUser.id && (
            <>
              <button
                onClick={() => {
                  setEditingComment(comment.id);
                  setEditContent(comment.content);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <Edit3 size={16} />
              </button>
              <button
                onClick={() => onCommentDelete(comment.id)}
                className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
          {enableModeration && (
            <div className="relative">
              <button className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                <MoreVertical size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {editingComment === comment.id ? (
        <div className="space-y-3">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            placeholder="Edit your comment..."
          />
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleEditSubmit(comment.id)}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Check size={16} />
              <span>Save</span>
            </button>
            <button
              onClick={() => {
                setEditingComment(null);
                setEditContent('');
              }}
              className="flex items-center space-x-2 px-3 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X size={16} />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-900 whitespace-pre-wrap">{comment.content}</p>
        </div>
      )}

      {/* Attachments */}
      {comment.attachments.length > 0 && (
        <div className="space-y-2">
          {comment.attachments.map(attachment => (
            <div
              key={attachment.id}
              className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg"
            >
              <Paperclip size={16} className="text-gray-500" />
              <span className="text-sm text-gray-700">{attachment.name}</span>
              <span className="text-xs text-gray-500">
                {(attachment.size / 1024).toFixed(1)}KB
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Reactions */}
      {renderReactions(comment)}

      {/* Replies */}
      {comment.replies.length > 0 && (
        <div className="ml-8 space-y-3 border-l-2 border-gray-100 pl-4">
          {comment.replies.map(reply => renderComment(reply))}
        </div>
      )}

      {/* Reply Form */}
      {replyTo === comment.id && (
        <div className="ml-8 space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            placeholder={`Reply to ${comment.author.name}...`}
          />
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCommentSubmit}
              disabled={loading || !newComment.trim()}
              className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Send size={16} />
              <span>Reply</span>
            </button>
            <button
              onClick={() => {
                setReplyTo(null);
                setNewComment('');
              }}
              className="flex items-center space-x-2 px-3 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X size={16} />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <MessageSquare size={20} />
            <span>Comments ({comments.length})</span>
          </h3>
          <p className="text-sm text-gray-600">Discuss milestone progress and collaborate with your team</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="most-liked">Most Liked</option>
            <option value="most-replies">Most Replies</option>
          </select>
        </div>
      </div>

      {/* Comment Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-sm font-semibold text-gray-700">
              {currentUser.name[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <textarea
              ref={commentInputRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="Add a comment..."
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {enableAttachments && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <Paperclip size={16} />
              </button>
            )}
            {enableMentions && (
              <button
                onClick={() => setShowMentions(!showMentions)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <AtSign size={16} />
              </button>
            )}
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <Smile size={16} />
            </button>
          </div>
          <button
            onClick={handleCommentSubmit}
            disabled={loading || !newComment.trim()}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Send size={16} />
            <span>Comment</span>
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {processedComments.map(comment => renderComment(comment))}
      </div>

      {/* Empty State */}
      {processedComments.length === 0 && (
        <div className="text-center py-8">
          <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No comments yet</h3>
          <p className="text-gray-600">Be the first to comment on this milestone</p>
        </div>
      )}

      {/* File Upload Input */}
      {enableAttachments && (
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept={allowedFileTypes.join(',')}
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            files.forEach(handleFileUpload);
          }}
        />
      )}
    </div>
  );
};

export default MilestoneCommentSystem;