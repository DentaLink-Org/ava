import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Reply, 
  Edit3, 
  Trash2, 
  MoreVertical,
  Heart,
  Flag,
  Share2,
  Hash,
  Bold,
  Italic,
  Link2,
  Image,
  FileText,
  Paperclip,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Settings,
  Bell,
  BellOff,
  Eye,
  EyeOff,
  Clock,
  User,
  Users,
  CheckCircle,
  AlertTriangle,
  Info,
  X,
  Plus,
  Minus,
  ChevronUp,
  ChevronDown,
  Quote,
  Code,
  List,
  Calendar
} from 'lucide-react';
import type { 
  Task, 
  TaskComment, 
  TeamMember
} from '../../tasks/types';

// Define missing types locally
interface TaskCommentThread {
  id: string;
  rootComment: TaskComment;
  replies: TaskComment[];
}

interface TaskCommentReaction {
  emoji: string;
  count: number;
  users: string[];
}

interface TaskCommentsSystemProps {
  task: Task;
  comments: TaskComment[];
  teamMembers: TeamMember[];
  currentUser: TeamMember;
  enableThreading?: boolean;
  enableReactions?: boolean;
  enableMentions?: boolean;
  enableFileAttachments?: boolean;
  enableRichText?: boolean;
  enableNotifications?: boolean;
  enableModeration?: boolean;
  maxCommentLength?: number;
  onCommentCreate?: (comment: Omit<TaskComment, 'id' | 'createdAt' | 'updatedAt' | 'isEdited' | 'editedAt' | 'mentions' | 'reactions' | 'metadata' | 'commentType'>) => Promise<void>;
  onCommentUpdate?: (commentId: string, updates: Partial<TaskComment>) => Promise<void>;
  onCommentDelete?: (commentId: string) => Promise<void>;
  onReactionAdd?: (commentId: string, reaction: string) => Promise<void>;
  onReactionRemove?: (commentId: string, reaction: string) => Promise<void>;
  onMentionUser?: (userId: string) => Promise<void>;
  onFileUpload?: (file: File) => Promise<string>;
}

interface CommentFilters {
  author?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  hasAttachments?: boolean;
  hasReactions?: boolean;
  showResolved?: boolean;
  showThreads?: boolean;
}

interface CommentSort {
  field: 'createdAt' | 'updatedAt' | 'reactions' | 'replies';
  direction: 'asc' | 'desc';
}

export const TaskCommentsSystem: React.FC<TaskCommentsSystemProps> = ({
  task,
  comments,
  teamMembers,
  currentUser,
  enableThreading = true,
  enableReactions = true,
  enableMentions = true,
  enableFileAttachments = true,
  enableRichText = true,
  enableNotifications = true,
  enableModeration = true,
  maxCommentLength = 2000,
  onCommentCreate,
  onCommentUpdate,
  onCommentDelete,
  onReactionAdd,
  onReactionRemove,
  onMentionUser,
  onFileUpload
}) => {
  // State management
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<CommentFilters>({});
  const [sortBy, setSortBy] = useState<CommentSort>({ field: 'createdAt', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());
  const [selectedComment, setSelectedComment] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [mentionSuggestions, setMentionSuggestions] = useState<TeamMember[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [notifications, setNotifications] = useState(true);

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Build comment threads
  const commentThreads = useMemo(() => {
    const threads: TaskCommentThread[] = [];
    const commentMap = new Map<string, TaskComment>();
    
    // Create comment map
    comments.forEach(comment => {
      commentMap.set(comment.id, comment);
    });

    // Build threads
    comments.forEach(comment => {
      if (!comment.parentId) {
        const thread: TaskCommentThread = {
          id: comment.id,
          rootComment: comment,
          replies: []
        };

        // Find replies
        const findReplies = (commentId: string): TaskComment[] => {
          return comments.filter(c => c.parentId === commentId);
        };

        thread.replies = findReplies(comment.id);
        threads.push(thread);
      }
    });

    return threads;
  }, [comments]);

  // Filter and sort comments
  const filteredComments = useMemo(() => {
    let filtered = commentThreads;

    // Apply filters
    if (filters.author) {
      filtered = filtered.filter(thread => 
        thread.rootComment.userId === filters.author ||
        thread.replies.some((reply: TaskComment) => reply.userId === filters.author)
      );
    }

    if (filters.dateRange) {
      const start = new Date(filters.dateRange.start);
      const end = new Date(filters.dateRange.end);
      filtered = filtered.filter(thread => {
        const threadDate = new Date(thread.rootComment.createdAt);
        return threadDate >= start && threadDate <= end;
      });
    }

    // TODO: Re-enable when attachments are supported
    // if (filters.hasAttachments) {
    //   filtered = filtered.filter(thread => 
    //     thread.rootComment.attachments && thread.rootComment.attachments.length > 0
    //   );
    // }

    if (filters.hasReactions) {
      filtered = filtered.filter(thread => 
        thread.rootComment.reactions && Object.keys(thread.rootComment.reactions).length > 0
      );
    }

    // TODO: Add resolved property to TaskComment interface
    // if (filters.showResolved === false) {
    //   filtered = filtered.filter(thread => !thread.rootComment.resolved);
    // }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(thread => 
        thread.rootComment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        thread.replies.some(reply => 
          reply.content.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const getValue = (thread: TaskCommentThread) => {
        switch (sortBy.field) {
          case 'createdAt':
            return new Date(thread.rootComment.createdAt).getTime();
          case 'updatedAt':
            return new Date(thread.rootComment.updatedAt || thread.rootComment.createdAt).getTime();
          case 'reactions':
            return thread.rootComment.reactions?.length || 0;
          case 'replies':
            return thread.replies.length;
          default:
            return 0;
        }
      };

      const aValue = getValue(a);
      const bValue = getValue(b);

      return sortBy.direction === 'desc' ? bValue - aValue : aValue - bValue;
    });

    return filtered;
  }, [commentThreads, filters, searchTerm, sortBy]);

  // Handle comment creation
  const handleCreateComment = useCallback(async () => {
    if (!newComment.trim() || !onCommentCreate) return;

    try {
      await onCommentCreate({
        taskId: task.id,
        content: newComment,
        userId: currentUser.id,
        parentId: replyingTo || undefined
      });

      setNewComment('');
      setReplyingTo(null);
      setReplyText('');
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  }, [newComment, onCommentCreate, task.id, currentUser.id, replyingTo]);

  // Handle comment update
  const handleUpdateComment = useCallback(async (commentId: string) => {
    if (!editingText.trim() || !onCommentUpdate) return;

    try {
      await onCommentUpdate(commentId, {
        content: editingText,
        updatedAt: new Date().toISOString()
      });

      setEditingComment(null);
      setEditingText('');
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  }, [editingText, onCommentUpdate]);

  // Handle comment deletion
  const handleDeleteComment = useCallback(async (commentId: string) => {
    if (!onCommentDelete) return;

    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await onCommentDelete(commentId);
      } catch (error) {
        console.error('Failed to delete comment:', error);
      }
    }
  }, [onCommentDelete]);

  // Handle reaction
  const handleReaction = useCallback(async (commentId: string, emoji: string) => {
    if (!onReactionAdd) return;

    try {
      await onReactionAdd(commentId, emoji);
      setShowEmojiPicker(null);
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  }, [onReactionAdd]);

  // Handle mention detection
  const handleMentionDetection = useCallback((text: string) => {
    const mentionRegex = /@(\w+)/g;
    const mentions = text.match(mentionRegex);
    
    if (mentions && enableMentions) {
      const suggestions = teamMembers.filter(member => 
        mentions.some(mention => 
          member.name.toLowerCase().includes(mention.slice(1).toLowerCase())
        )
      );
      setMentionSuggestions(suggestions);
      setShowMentions(suggestions.length > 0);
    } else {
      setShowMentions(false);
    }
  }, [teamMembers, enableMentions]);

  // Handle file upload
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onFileUpload) return;

    try {
      const url = await onFileUpload(file);
      setNewComment(prev => prev + `\n[${file.name}](${url})`);
    } catch (error) {
      console.error('Failed to upload file:', error);
    }
  }, [onFileUpload]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [newComment]);

  // Render comment
  const renderComment = (comment: TaskComment, isReply: boolean = false) => {
    const author = teamMembers.find(member => member.id === comment.userId);
    const isOwner = comment.userId === currentUser.id;
    const isEditing = editingComment === comment.id;

    return (
      <div
        key={comment.id}
        className={`
          ${isReply ? 'ml-12 border-l-2 border-gray-200 pl-4' : ''}
          ${selectedComment === comment.id ? 'bg-blue-50 border-blue-200' : ''}
          border rounded-lg p-4 transition-colors
        `}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {author?.name.charAt(0) || 'U'}
            </div>
            <div>
              <div className="font-medium text-sm">{author?.name || 'Unknown User'}</div>
              <div className="text-xs text-gray-500">
                {new Date(comment.createdAt).toLocaleString()}
                {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                  <span className="ml-1">(edited)</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {enableReactions && (
              <button
                onClick={() => setShowEmojiPicker(showEmojiPicker === comment.id ? null : comment.id)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <Heart className="w-4 h-4" />
              </button>
            )}
            
            {enableThreading && !isReply && (
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <Reply className="w-4 h-4" />
              </button>
            )}

            {isOwner && (
              <>
                <button
                  onClick={() => {
                    setEditingComment(comment.id);
                    setEditingText(comment.content);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="p-1 text-red-400 hover:text-red-600 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-3">
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                maxLength={maxCommentLength}
              />
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  {maxCommentLength - editingText.length} characters remaining
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingComment(null)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpdateComment(comment.id)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap">{comment.content}</div>
              
              {/* Attachments - TODO: Add attachments support to TaskComment interface */}
              {/* {comment.attachments && comment.attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {comment.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <Paperclip className="w-4 h-4 text-gray-400" />
                      <a 
                        href={attachment.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {attachment.name}
                      </a>
                    </div>
                  ))}
                </div>
              )} */}

              {/* Reactions */}
              {comment.reactions && Object.keys(comment.reactions).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {Object.entries(comment.reactions).map(([emoji, count]) => (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(comment.id, emoji)}
                      className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full"
                    >
                      <span className="mr-1">{emoji}</span>
                      <span>{count as number}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Emoji Picker */}
        {showEmojiPicker === comment.id && (
          <div className="mt-2 p-2 bg-white border border-gray-300 rounded-lg shadow-lg">
            <div className="flex space-x-1">
              {['👍', '👎', '❤️', '😂', '😮', '😢', '😡', '🎉'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(comment.id, emoji)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Reply Form */}
        {replyingTo === comment.id && (
          <div className="mt-4 ml-8 border-l-2 border-blue-200 pl-4">
            <div className="space-y-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                maxLength={maxCommentLength}
              />
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Replying to {author?.name}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setNewComment(replyText);
                      handleCreateComment();
                    }}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Comments ({comments.length})
          </h3>
          <p className="text-sm text-gray-600">
            Discuss and collaborate on this task
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search comments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
          </button>

          {enableNotifications && (
            <button
              onClick={() => setNotifications(!notifications)}
              className={`p-2 rounded-lg ${notifications ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}
            >
              {notifications ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Author
              </label>
              <select
                value={filters.author || ''}
                onChange={(e) => setFilters({...filters, author: e.target.value || undefined})}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="">All authors</option>
                {teamMembers.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort by
              </label>
              <select
                value={`${sortBy.field}-${sortBy.direction}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-');
                  setSortBy({ field: field as any, direction: direction as any });
                }}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="createdAt-desc">Newest first</option>
                <option value="createdAt-asc">Oldest first</option>
                <option value="reactions-desc">Most reactions</option>
                <option value="replies-desc">Most replies</option>
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.hasAttachments || false}
                  onChange={(e) => setFilters({...filters, hasAttachments: e.target.checked || undefined})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Has attachments</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.hasReactions || false}
                  onChange={(e) => setFilters({...filters, hasReactions: e.target.checked || undefined})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Has reactions</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* New Comment Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {currentUser.name.charAt(0)}
          </div>
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={newComment}
              onChange={(e) => {
                setNewComment(e.target.value);
                handleMentionDetection(e.target.value);
              }}
              placeholder="Write a comment..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              maxLength={maxCommentLength}
            />

            {/* Mention suggestions */}
            {showMentions && mentionSuggestions.length > 0 && (
              <div className="mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {mentionSuggestions.map(member => (
                  <button
                    key={member.id}
                    onClick={() => {
                      setNewComment(prev => prev.replace(/@\w*$/, `@${member.name} `));
                      setShowMentions(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                      {member.name.charAt(0)}
                    </div>
                    <span className="text-sm">{member.name}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {enableFileAttachments && (
                  <>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      accept="image/*,application/pdf,.doc,.docx,.txt"
                    />
                  </>
                )}

                {enableRichText && (
                  <div className="flex items-center space-x-1">
                    <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                      <Bold className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                      <Italic className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                      <Link2 className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                      <Code className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  {maxCommentLength - newComment.length} characters remaining
                </div>
              </div>

              <button
                onClick={handleCreateComment}
                disabled={!newComment.trim()}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4 mr-2" />
                Comment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {filteredComments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          filteredComments.map(thread => (
            <div key={thread.id} className="bg-white rounded-lg border border-gray-200">
              {renderComment(thread.rootComment)}
              
              {/* Replies */}
              {thread.replies.length > 0 && (
                <div className="mt-4 space-y-3">
                  {thread.replies.map(reply => renderComment(reply, true))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};