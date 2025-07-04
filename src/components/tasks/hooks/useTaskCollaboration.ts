import { useState, useEffect, useCallback, useRef } from 'react';
import type { 
  TaskComment,
  TaskAttachment,
  TaskCommentType,
  CommentOptions,
  TasksError
} from '../types';
import { taskCollaboration } from '../api/task-collaboration';

/**
 * Task Collaboration Hook Configuration
 */
interface UseTaskCollaborationOptions {
  taskId: string;
  userId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableRealtime?: boolean;
  enableTypingIndicators?: boolean;
  enableNotifications?: boolean;
  maxComments?: number;
  threaded?: boolean;
  enableAttachments?: boolean;
  maxAttachmentSize?: number;
  allowedFileTypes?: string[];
}

/**
 * Typing Indicator State
 */
interface TypingIndicator {
  userId: string;
  taskId: string;
  timestamp: string;
  isTyping: boolean;
}

/**
 * File Upload Progress
 */
interface FileUploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

/**
 * Collaboration Activity
 */
interface CollaborationActivity {
  id: string;
  type: 'comment' | 'attachment' | 'mention' | 'reaction' | 'edit';
  userId: string;
  taskId: string;
  timestamp: string;
  data: any;
}

/**
 * Mention Suggestion
 */
interface MentionSuggestion {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  relevanceScore: number;
}

/**
 * Task Collaboration Hook Return Type
 */
interface UseTaskCollaborationReturn {
  // Core comment data
  comments: TaskComment[];
  loading: boolean;
  error: TasksError | null;
  
  // Comment operations
  addComment: (content: string, options?: CommentOptions) => Promise<TaskComment>;
  updateComment: (commentId: string, content: string) => Promise<TaskComment>;
  deleteComment: (commentId: string) => Promise<void>;
  replyToComment: (parentId: string, content: string) => Promise<TaskComment>;
  
  // Reaction operations
  addReaction: (commentId: string, reaction: string) => Promise<TaskComment>;
  removeReaction: (commentId: string, reaction: string) => Promise<TaskComment>;
  toggleReaction: (commentId: string, reaction: string) => Promise<TaskComment>;
  
  // Attachment operations
  attachments: TaskAttachment[];
  uploadProgress: FileUploadProgress[];
  addAttachment: (file: File, description?: string, isPublic?: boolean) => Promise<TaskAttachment>;
  removeAttachment: (attachmentId: string) => Promise<void>;
  downloadAttachment: (attachmentId: string) => Promise<void>;
  
  // Mention functionality
  mentionUser: (userId: string, commentId: string) => Promise<void>;
  getMentionSuggestions: (query: string) => Promise<MentionSuggestion[]>;
  searchMentions: (query: string) => Promise<TaskComment[]>;
  
  // Real-time collaboration
  typingUsers: string[];
  isTyping: boolean;
  setTyping: (isTyping: boolean) => void;
  onlineUsers: string[];
  
  // Activity and history
  activities: CollaborationActivity[];
  getTaskHistory: (includeComments?: boolean, includeAttachments?: boolean) => Promise<CollaborationActivity[]>;
  
  // Search and filtering
  searchComments: (query: string) => Promise<TaskComment[]>;
  filterComments: (filter: { 
    type?: TaskCommentType; 
    userId?: string; 
    dateRange?: { start: string; end: string }; 
  }) => TaskComment[];
  
  // Bulk operations
  bulkDeleteComments: (commentIds: string[]) => Promise<{ success: boolean; errors: string[] }>;
  bulkArchiveComments: (commentIds: string[]) => Promise<{ success: boolean; errors: string[] }>;
  
  // Data management
  refetch: () => Promise<void>;
  loadMoreComments: () => Promise<void>;
  hasMoreComments: boolean;
  
  // Settings and preferences
  updateNotificationPreferences: (preferences: {
    mentions: boolean;
    replies: boolean;
    allComments: boolean;
  }) => Promise<void>;
  
  // Real-time subscriptions
  subscribe: (callback: (event: CollaborationEvent) => void) => () => void;
  subscribeToTyping: (callback: (typingUsers: string[]) => void) => () => void;
  
  // Utility functions
  formatComment: (comment: TaskComment) => {
    formattedContent: string;
    mentions: string[];
    links: string[];
  };
  isCommentEditable: (comment: TaskComment) => boolean;
  isCommentDeletable: (comment: TaskComment) => boolean;
  getCommentThread: (commentId: string) => TaskComment[];
  exportComments: (format: 'txt' | 'pdf' | 'html') => Promise<{ data: any; filename: string }>;
}

/**
 * Collaboration Event for Real-time Updates
 */
interface CollaborationEvent {
  type: 'comment-created' | 'comment-updated' | 'comment-deleted' | 'reaction-added' | 'reaction-removed' | 
        'attachment-added' | 'attachment-removed' | 'user-mentioned' | 'typing-start' | 'typing-stop';
  data: any;
  timestamp: string;
  userId?: string;
}

/**
 * Mock Data for Online Users and Team Members
 */
const mockTeamMembers = [
  { userId: 'user-1', name: 'Alice Johnson', email: 'alice@company.com', avatar: '/avatars/alice.jpg', isOnline: true },
  { userId: 'user-2', name: 'Bob Smith', email: 'bob@company.com', avatar: '/avatars/bob.jpg', isOnline: true },
  { userId: 'user-3', name: 'Carol Davis', email: 'carol@company.com', avatar: '/avatars/carol.jpg', isOnline: false },
  { userId: 'user-manager', name: 'David Wilson', email: 'david@company.com', avatar: '/avatars/david.jpg', isOnline: true },
  { userId: 'user-designer', name: 'Emma Chen', email: 'emma@company.com', avatar: '/avatars/emma.jpg', isOnline: false }
];

/**
 * Simulate API delay
 */
const simulateDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Task Collaboration Hook Implementation
 * 
 * Provides comprehensive collaboration capabilities including:
 * - Real-time comment synchronization with threading
 * - @mention functionality with notifications
 * - File upload and management with progress tracking
 * - Typing indicators for live collaboration
 * - Reaction system for comments
 * - Advanced search and filtering
 * - Bulk operations for comment management
 */
export function useTaskCollaboration(options: UseTaskCollaborationOptions): UseTaskCollaborationReturn {
  const {
    taskId,
    userId = 'current-user', // In production, would get from auth context
    autoRefresh = true,
    refreshInterval = 30000,
    enableRealtime = true,
    enableTypingIndicators = true,
    enableNotifications = true,
    maxComments = 100,
    threaded = true,
    enableAttachments = true,
    maxAttachmentSize = 50 * 1024 * 1024, // 50MB
    allowedFileTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'application/pdf', 
      'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  } = options;

  // Core state
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<TasksError | null>(null);
  const [hasMoreComments, setHasMoreComments] = useState(false);

  // Real-time collaboration state
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isTyping, setIsTypingState] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>(
    mockTeamMembers.filter(m => m.isOnline).map(m => m.userId)
  );

  // Upload and activity state
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress[]>([]);
  const [activities, setActivities] = useState<CollaborationActivity[]>([]);

  // Refs for managing subscriptions and typing debounce
  const subscriptionsRef = useRef<Map<string, (() => void)[]>>(new Map());
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const realtimeListenerRef = useRef<((event: CustomEvent) => void) | null>(null);

  // Helper function to create error
  const createError = useCallback((code: string, message: string, originalError?: any): TasksError => {
    const error = new Error(message) as TasksError;
    error.code = code;
    error.details = originalError;
    return error;
  }, []);

  // Core data fetching
  const fetchComments = useCallback(async (offset = 0, limit = maxComments): Promise<void> => {
    try {
      setError(null);
      
      const response = await taskCollaboration.getTaskComments(taskId, threaded, limit, offset);
      
      if (offset === 0) {
        setComments(response.comments);
      } else {
        setComments(prev => [...prev, ...response.comments]);
      }
      
      setHasMoreComments(response.hasMore);
      
    } catch (err) {
      const collaborationError = err as TasksError;
      setError(collaborationError);
      console.error('Failed to fetch comments:', collaborationError);
    }
  }, [taskId, maxComments, threaded]);

  const fetchAttachments = useCallback(async (): Promise<void> => {
    if (!enableAttachments) return;
    
    try {
      const taskAttachments = await taskCollaboration.getTaskAttachments(taskId);
      setAttachments(taskAttachments);
    } catch (err) {
      console.error('Failed to fetch attachments:', err);
    }
  }, [taskId, enableAttachments]);

  // Comment operations
  const addComment = useCallback(async (content: string, options: CommentOptions = {}): Promise<TaskComment> => {
    try {
      setError(null);
      
      const newComment = await taskCollaboration.createComment(taskId, content, userId, options);
      
      // Add to local state
      setComments(prev => threaded ? [newComment, ...prev] : [...prev, newComment]);
      
      // Add to activities
      setActivities(prev => [{
        id: newComment.id,
        type: 'comment',
        userId,
        taskId,
        timestamp: newComment.createdAt,
        data: newComment
      }, ...prev]);
      
      // Stop typing indicator
      setTyping(false);
      
      return newComment;
    } catch (err) {
      const commentError = err as TasksError;
      setError(commentError);
      throw commentError;
    }
  }, [taskId, userId, threaded]);

  const updateComment = useCallback(async (commentId: string, content: string): Promise<TaskComment> => {
    try {
      setError(null);
      
      const updatedComment = await taskCollaboration.updateComment(commentId, content, userId);
      
      // Update local state
      setComments(prev => prev.map(comment => 
        comment.id === commentId ? updatedComment : comment
      ));
      
      // Add to activities
      setActivities(prev => [{
        id: `edit-${commentId}-${Date.now()}`,
        type: 'edit',
        userId,
        taskId,
        timestamp: updatedComment.updatedAt,
        data: { commentId, newContent: content }
      }, ...prev]);
      
      return updatedComment;
    } catch (err) {
      const commentError = err as TasksError;
      setError(commentError);
      throw commentError;
    }
  }, [userId, taskId]);

  const deleteComment = useCallback(async (commentId: string): Promise<void> => {
    try {
      setError(null);
      
      await taskCollaboration.deleteComment(commentId, userId);
      
      // Remove from local state (or mark as deleted if it has replies)
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          const hasReplies = prev.some(c => c.parentId === commentId);
          if (hasReplies) {
            return { 
              ...comment, 
              content: '[Comment deleted]',
              metadata: { ...comment.metadata, deleted: true }
            };
          }
          return comment;
        }
        return comment;
      }).filter(comment => comment.id !== commentId || comment.metadata?.deleted));
      
    } catch (err) {
      const commentError = err as TasksError;
      setError(commentError);
      throw commentError;
    }
  }, [userId]);

  const replyToComment = useCallback(async (parentId: string, content: string): Promise<TaskComment> => {
    return addComment(content, { parentId, commentType: TaskCommentType.COMMENT });
  }, [addComment]);

  // Reaction operations
  const addReaction = useCallback(async (commentId: string, reaction: string): Promise<TaskComment> => {
    try {
      setError(null);
      
      const updatedComment = await taskCollaboration.addReaction(commentId, reaction, userId);
      
      // Update local state
      setComments(prev => prev.map(comment => 
        comment.id === commentId ? updatedComment : comment
      ));
      
      return updatedComment;
    } catch (err) {
      const reactionError = err as TasksError;
      setError(reactionError);
      throw reactionError;
    }
  }, [userId]);

  const removeReaction = useCallback(async (commentId: string, reaction: string): Promise<TaskComment> => {
    try {
      setError(null);
      
      const updatedComment = await taskCollaboration.removeReaction(commentId, reaction, userId);
      
      // Update local state
      setComments(prev => prev.map(comment => 
        comment.id === commentId ? updatedComment : comment
      ));
      
      return updatedComment;
    } catch (err) {
      const reactionError = err as TasksError;
      setError(reactionError);
      throw reactionError;
    }
  }, [userId]);

  const toggleReaction = useCallback(async (commentId: string, reaction: string): Promise<TaskComment> => {
    const comment = comments.find(c => c.id === commentId);
    if (!comment) {
      throw createError('COMMENT_NOT_FOUND', `Comment ${commentId} not found`);
    }
    
    const hasReaction = comment.reactions && comment.reactions[reaction] > 0;
    return hasReaction ? 
      removeReaction(commentId, reaction) : 
      addReaction(commentId, reaction);
  }, [comments, addReaction, removeReaction, createError]);

  // Attachment operations
  const addAttachment = useCallback(async (
    file: File, 
    description?: string, 
    isPublic = false
  ): Promise<TaskAttachment> => {
    if (!enableAttachments) {
      throw createError('FEATURE_DISABLED', 'File attachments are disabled');
    }
    
    if (file.size > maxAttachmentSize) {
      throw createError('FILE_TOO_LARGE', 
        `File size exceeds maximum of ${maxAttachmentSize / (1024 * 1024)}MB`);
    }
    
    if (!allowedFileTypes.includes(file.type)) {
      throw createError('INVALID_FILE_TYPE', `File type ${file.type} is not allowed`);
    }
    
    try {
      setError(null);
      
      const fileId = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Add upload progress
      setUploadProgress(prev => [...prev, {
        fileId,
        fileName: file.name,
        progress: 0,
        status: 'uploading'
      }]);
      
      // Simulate upload progress
      const uploadPromise = new Promise<TaskAttachment>((resolve, reject) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 20;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            // Complete the upload
            taskCollaboration.addAttachment(taskId, file, userId, description, isPublic)
              .then(attachment => {
                setUploadProgress(prev => prev.map(p => 
                  p.fileId === fileId ? { ...p, progress: 100, status: 'completed' } : p
                ));
                
                // Remove from progress after a delay
                setTimeout(() => {
                  setUploadProgress(prev => prev.filter(p => p.fileId !== fileId));
                }, 2000);
                
                resolve(attachment);
              })
              .catch(error => {
                setUploadProgress(prev => prev.map(p => 
                  p.fileId === fileId ? { ...p, status: 'error', error: error.message } : p
                ));
                reject(error);
              });
          } else {
            setUploadProgress(prev => prev.map(p => 
              p.fileId === fileId ? { ...p, progress } : p
            ));
          }
        }, 200);
      });
      
      const attachment = await uploadPromise;
      
      // Add to local state
      setAttachments(prev => [attachment, ...prev]);
      
      // Add to activities
      setActivities(prev => [{
        id: attachment.id,
        type: 'attachment',
        userId,
        taskId,
        timestamp: attachment.createdAt,
        data: attachment
      }, ...prev]);
      
      return attachment;
    } catch (err) {
      const uploadError = err as TasksError;
      setError(uploadError);
      throw uploadError;
    }
  }, [enableAttachments, maxAttachmentSize, allowedFileTypes, taskId, userId, createError]);

  const removeAttachment = useCallback(async (attachmentId: string): Promise<void> => {
    try {
      setError(null);
      
      await taskCollaboration.removeAttachment(attachmentId, userId);
      
      // Remove from local state
      setAttachments(prev => prev.filter(a => a.id !== attachmentId));
      
    } catch (err) {
      const attachmentError = err as TasksError;
      setError(attachmentError);
      throw attachmentError;
    }
  }, [userId]);

  const downloadAttachment = useCallback(async (attachmentId: string): Promise<void> => {
    const attachment = attachments.find(a => a.id === attachmentId);
    if (!attachment) {
      throw createError('ATTACHMENT_NOT_FOUND', `Attachment ${attachmentId} not found`);
    }
    
    // In production, would handle actual file download
    const link = document.createElement('a');
    link.href = attachment.filePath;
    link.download = attachment.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [attachments, createError]);

  // Mention functionality
  const mentionUser = useCallback(async (mentionedUserId: string, commentId: string): Promise<void> => {
    try {
      await taskCollaboration.mentionUser(mentionedUserId, taskId, commentId, userId);
      
      // Add to activities
      setActivities(prev => [{
        id: `mention-${mentionedUserId}-${Date.now()}`,
        type: 'mention',
        userId,
        taskId,
        timestamp: new Date().toISOString(),
        data: { mentionedUserId, commentId }
      }, ...prev]);
      
    } catch (err) {
      console.error('Failed to send mention notification:', err);
    }
  }, [taskId, userId]);

  const getMentionSuggestions = useCallback(async (query: string): Promise<MentionSuggestion[]> => {
    await simulateDelay(200);
    
    if (!query || query.length < 2) return [];
    
    const suggestions = mockTeamMembers
      .filter(member => 
        member.name.toLowerCase().includes(query.toLowerCase()) ||
        member.email.toLowerCase().includes(query.toLowerCase())
      )
      .map(member => ({
        userId: member.userId,
        name: member.name,
        email: member.email,
        avatar: member.avatar,
        isOnline: member.isOnline,
        relevanceScore: member.name.toLowerCase().startsWith(query.toLowerCase()) ? 100 : 80
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5);
    
    return suggestions;
  }, []);

  const searchMentions = useCallback(async (query: string): Promise<TaskComment[]> => {
    return taskCollaboration.searchComments(taskId, `@${query}`);
  }, [taskId]);

  // Typing indicators
  const setTyping = useCallback((typing: boolean): void => {
    if (!enableTypingIndicators) return;
    
    setIsTypingState(typing);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Clear debounce timeout
    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current);
    }
    
    // Debounce typing notifications
    typingDebounceRef.current = setTimeout(() => {
      taskCollaboration.setTypingIndicator(taskId, userId, typing);
      
      if (typing) {
        // Auto-stop typing after 3 seconds
        typingTimeoutRef.current = setTimeout(() => {
          setIsTypingState(false);
          taskCollaboration.setTypingIndicator(taskId, userId, false);
        }, 3000);
      }
    }, 500);
  }, [enableTypingIndicators, taskId, userId]);

  // Search and filtering
  const searchComments = useCallback(async (query: string): Promise<TaskComment[]> => {
    return taskCollaboration.searchComments(taskId, query);
  }, [taskId]);

  const filterComments = useCallback((filter: { 
    type?: TaskCommentType; 
    userId?: string; 
    dateRange?: { start: string; end: string }; 
  }): TaskComment[] => {
    let filtered = [...comments];
    
    if (filter.type) {
      filtered = filtered.filter(comment => comment.commentType === filter.type);
    }
    
    if (filter.userId) {
      filtered = filtered.filter(comment => comment.userId === filter.userId);
    }
    
    if (filter.dateRange) {
      const start = new Date(filter.dateRange.start);
      const end = new Date(filter.dateRange.end);
      filtered = filtered.filter(comment => {
        const commentDate = new Date(comment.createdAt);
        return commentDate >= start && commentDate <= end;
      });
    }
    
    return filtered;
  }, [comments]);

  // Bulk operations
  const bulkDeleteComments = useCallback(async (commentIds: string[]): Promise<{ success: boolean; errors: string[] }> => {
    const errors: string[] = [];
    
    for (const commentId of commentIds) {
      try {
        await deleteComment(commentId);
      } catch (error) {
        errors.push(`Failed to delete comment ${commentId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    return {
      success: errors.length === 0,
      errors
    };
  }, [deleteComment]);

  const bulkArchiveComments = useCallback(async (commentIds: string[]): Promise<{ success: boolean; errors: string[] }> => {
    // Mock implementation - would mark comments as archived
    await simulateDelay(500);
    
    setComments(prev => prev.map(comment => 
      commentIds.includes(comment.id) 
        ? { ...comment, metadata: { ...comment.metadata, archived: true } }
        : comment
    ));
    
    return { success: true, errors: [] };
  }, []);

  // Data management
  const refetch = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      await Promise.all([
        fetchComments(0, maxComments),
        fetchAttachments()
      ]);
    } finally {
      setLoading(false);
    }
  }, [fetchComments, fetchAttachments, maxComments]);

  const loadMoreComments = useCallback(async (): Promise<void> => {
    if (!hasMoreComments || loading) return;
    
    await fetchComments(comments.length, maxComments);
  }, [hasMoreComments, loading, comments.length, fetchComments, maxComments]);

  const getTaskHistory = useCallback(async (
    includeComments = true, 
    includeAttachments = true
  ): Promise<CollaborationActivity[]> => {
    const history = await taskCollaboration.getTaskHistory(taskId, includeComments, includeAttachments);
    
    const activities: CollaborationActivity[] = history.map(item => ({
      id: item.id,
      type: item.type as any,
      userId: item.userId || '',
      taskId,
      timestamp: item.timestamp,
      data: item.data
    }));
    
    setActivities(activities);
    return activities;
  }, [taskId]);

  // Settings and preferences
  const updateNotificationPreferences = useCallback(async (preferences: {
    mentions: boolean;
    replies: boolean;
    allComments: boolean;
  }): Promise<void> => {
    await simulateDelay(300);
    
    // In production, would save to user preferences
    localStorage.setItem('task-collaboration-preferences', JSON.stringify(preferences));
  }, []);

  // Real-time subscriptions
  const subscribe = useCallback((callback: (event: CollaborationEvent) => void): (() => void) => {
    const subscriptionId = Math.random().toString(36).substr(2, 9);
    const currentSubscriptions = subscriptionsRef.current.get('collaboration') || [];
    
    const unsubscribe = () => {
      subscriptionsRef.current.set('collaboration', 
        currentSubscriptions.filter(sub => sub !== unsubscribe)
      );
    };
    
    currentSubscriptions.push(unsubscribe);
    subscriptionsRef.current.set('collaboration', currentSubscriptions);
    
    return unsubscribe;
  }, []);

  const subscribeToTyping = useCallback((callback: (typingUsers: string[]) => void): (() => void) => {
    return subscribe((event) => {
      if (event.type === 'typing-start' || event.type === 'typing-stop') {
        callback(typingUsers);
      }
    });
  }, [subscribe, typingUsers]);

  // Utility functions
  const formatComment = useCallback((comment: TaskComment): {
    formattedContent: string;
    mentions: string[];
    links: string[];
  } => {
    const mentions = comment.mentions || [];
    const linkRegex = /(https?:\/\/[^\s]+)/g;
    const links = comment.content.match(linkRegex) || [];
    
    let formattedContent = comment.content;
    
    // Format mentions
    mentions.forEach(mention => {
      const mentionRegex = new RegExp(`@${mention}`, 'g');
      formattedContent = formattedContent.replace(mentionRegex, `<span class="mention">@${mention}</span>`);
    });
    
    // Format links
    links.forEach(link => {
      formattedContent = formattedContent.replace(link, `<a href="${link}" target="_blank">${link}</a>`);
    });
    
    return {
      formattedContent,
      mentions,
      links
    };
  }, []);

  const isCommentEditable = useCallback((comment: TaskComment): boolean => {
    return comment.userId === userId && !comment.metadata?.deleted;
  }, [userId]);

  const isCommentDeletable = useCallback((comment: TaskComment): boolean => {
    return comment.userId === userId && !comment.metadata?.deleted;
  }, [userId]);

  const getCommentThread = useCallback((commentId: string): TaskComment[] => {
    const thread: TaskComment[] = [];
    
    // Find the root comment
    let currentComment = comments.find(c => c.id === commentId);
    while (currentComment && currentComment.parentId) {
      currentComment = comments.find(c => c.id === currentComment!.parentId);
    }
    
    if (currentComment) {
      thread.push(currentComment);
      
      // Get all replies recursively
      const getReplies = (parentId: string): TaskComment[] => {
        const replies = comments
          .filter(c => c.parentId === parentId)
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        
        const allReplies: TaskComment[] = [];
        for (const reply of replies) {
          allReplies.push(reply);
          allReplies.push(...getReplies(reply.id));
        }
        
        return allReplies;
      };
      
      thread.push(...getReplies(currentComment.id));
    }
    
    return thread;
  }, [comments]);

  const exportComments = useCallback(async (format: 'txt' | 'pdf' | 'html'): Promise<{ data: any; filename: string }> => {
    await simulateDelay(500);
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `task-${taskId}-comments-${timestamp}`;
    
    if (format === 'txt') {
      const textData = comments.map(comment => 
        `[${comment.createdAt}] ${comment.userId}: ${comment.content}`
      ).join('\n\n');
      
      return {
        data: textData,
        filename: `${filename}.txt`
      };
    } else {
      return {
        data: `${format.toUpperCase()} export would be implemented with appropriate library`,
        filename: `${filename}.${format}`
      };
    }
  }, [comments, taskId]);

  // Effects
  
  // Initial data fetch
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (!loading) {
        fetchComments(0, comments.length || maxComments);
        if (enableAttachments) {
          fetchAttachments();
        }
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loading, comments.length, maxComments, fetchComments, enableAttachments, fetchAttachments]);

  // Real-time updates
  useEffect(() => {
    if (!enableRealtime) return;

    const handleCollaborationEvent = (event: CustomEvent) => {
      const collaborationEvent = event.detail;
      
      switch (collaborationEvent.type) {
        case 'comment-created':
          if (collaborationEvent.taskId === taskId && collaborationEvent.comment) {
            setComments(prev => {
              // Avoid duplicates
              if (prev.some(c => c.id === collaborationEvent.comment.id)) return prev;
              return threaded ? [collaborationEvent.comment, ...prev] : [...prev, collaborationEvent.comment];
            });
          }
          break;
          
        case 'comment-updated':
          if (collaborationEvent.taskId === taskId && collaborationEvent.comment) {
            setComments(prev => prev.map(c => 
              c.id === collaborationEvent.comment.id ? collaborationEvent.comment : c
            ));
          }
          break;
          
        case 'comment-deleted':
          if (collaborationEvent.taskId === taskId) {
            setComments(prev => prev.filter(c => c.id !== collaborationEvent.commentId));
          }
          break;
          
        case 'attachment-added':
          if (collaborationEvent.taskId === taskId && collaborationEvent.attachment) {
            setAttachments(prev => {
              // Avoid duplicates
              if (prev.some(a => a.id === collaborationEvent.attachment.id)) return prev;
              return [collaborationEvent.attachment, ...prev];
            });
          }
          break;
          
        case 'attachment-removed':
          if (collaborationEvent.taskId === taskId) {
            setAttachments(prev => prev.filter(a => a.id !== collaborationEvent.attachmentId));
          }
          break;
          
        case 'typing-indicator':
          if (collaborationEvent.taskId === taskId && enableTypingIndicators) {
            setTypingUsers(prev => {
              if (collaborationEvent.isTyping) {
                return prev.includes(collaborationEvent.userId) ? prev : [...prev, collaborationEvent.userId];
              } else {
                return prev.filter(u => u !== collaborationEvent.userId);
              }
            });
          }
          break;
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('task-collaboration-event', handleCollaborationEvent as EventListener);
      realtimeListenerRef.current = handleCollaborationEvent;
      
      return () => {
        window.removeEventListener('task-collaboration-event', handleCollaborationEvent as EventListener);
        realtimeListenerRef.current = null;
      };
    }
  }, [enableRealtime, taskId, threaded, enableTypingIndicators]);

  // Cleanup typing indicators on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (typingDebounceRef.current) {
        clearTimeout(typingDebounceRef.current);
      }
      
      // Stop typing indicator
      if (isTyping && enableTypingIndicators) {
        taskCollaboration.setTypingIndicator(taskId, userId, false);
      }
      
      // Clear all subscriptions
      subscriptionsRef.current.clear();
    };
  }, [isTyping, enableTypingIndicators, taskId, userId]);

  return {
    // Core comment data
    comments,
    loading,
    error,
    
    // Comment operations
    addComment,
    updateComment,
    deleteComment,
    replyToComment,
    
    // Reaction operations
    addReaction,
    removeReaction,
    toggleReaction,
    
    // Attachment operations
    attachments,
    uploadProgress,
    addAttachment,
    removeAttachment,
    downloadAttachment,
    
    // Mention functionality
    mentionUser,
    getMentionSuggestions,
    searchMentions,
    
    // Real-time collaboration
    typingUsers,
    isTyping,
    setTyping,
    onlineUsers,
    
    // Activity and history
    activities,
    getTaskHistory,
    
    // Search and filtering
    searchComments,
    filterComments,
    
    // Bulk operations
    bulkDeleteComments,
    bulkArchiveComments,
    
    // Data management
    refetch,
    loadMoreComments,
    hasMoreComments,
    
    // Settings and preferences
    updateNotificationPreferences,
    
    // Real-time subscriptions
    subscribe,
    subscribeToTyping,
    
    // Utility functions
    formatComment,
    isCommentEditable,
    isCommentDeletable,
    getCommentThread,
    exportComments
  };
}