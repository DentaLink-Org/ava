import type { 
  TaskComment,
  TaskAttachment,
  CommentOptions,
  TasksError
} from '../types';

import { TASK_CONSTANTS, TaskCommentType } from '../types';

/**
 * Task Collaboration API
 * 
 * Provides comprehensive collaboration features for tasks including:
 * - Comment system with threading and mentions
 * - File attachment management
 * - Real-time collaboration features
 * - Notification management
 * - Activity tracking
 * - @mention functionality
 */

// Simulate API delay
const simulateDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Generate unique ID
const generateId = () => `collab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Mock data stores
const mockComments: TaskComment[] = [
  {
    id: 'comment-1',
    taskId: 'task-1',
    userId: 'user-1',
    content: 'I\'ve started working on the authentication implementation. @user-manager, could you review the security requirements?',
    commentType: TaskCommentType.COMMENT,
    createdAt: '2025-07-04T10:30:00Z',
    updatedAt: '2025-07-04T10:30:00Z',
    isEdited: false,
    mentions: ['user-manager'],
    reactions: { thumbsUp: 2, heart: 1 },
    metadata: {}
  },
  {
    id: 'comment-2',
    taskId: 'task-1',
    userId: 'user-manager',
    content: 'Good progress! Please make sure to implement 2FA as discussed. I\'ll schedule a security review for next week.',
    commentType: TaskCommentType.COMMENT,
    parentId: 'comment-1',
    createdAt: '2025-07-04T11:15:00Z',
    updatedAt: '2025-07-04T11:15:00Z',
    isEdited: false,
    mentions: [],
    reactions: { thumbsUp: 3 },
    metadata: {}
  },
  {
    id: 'comment-3',
    taskId: 'task-2',
    userId: 'user-2',
    content: 'Database optimization complete. Performance improvement: 65% faster queries.',
    commentType: TaskCommentType.UPDATE,
    createdAt: '2025-07-04T14:20:00Z',
    updatedAt: '2025-07-04T14:20:00Z',
    isEdited: false,
    mentions: [],
    reactions: { celebrate: 5 },
    metadata: { 
      performance_improvement: '65%',
      benchmark_results: 'queries_now_avg_150ms'
    }
  }
];

const mockAttachments: TaskAttachment[] = [
  {
    id: 'attachment-1',
    taskId: 'task-1',
    fileName: 'auth_requirements.pdf',
    filePath: '/uploads/task-1/auth_requirements.pdf',
    fileSize: 245760,
    mimeType: 'application/pdf',
    fileExtension: 'pdf',
    fileHash: 'sha256:abc123...',
    uploadedBy: 'user-manager',
    createdAt: '2025-07-04T09:45:00Z',
    isPublic: false,
    description: 'Security requirements and compliance documentation',
    metadata: {
      document_type: 'requirements',
      confidentiality: 'internal',
      approval_status: 'approved'
    }
  },
  {
    id: 'attachment-2',
    taskId: 'task-2',
    fileName: 'db_performance_report.xlsx',
    filePath: '/uploads/task-2/db_performance_report.xlsx',
    fileSize: 89344,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    fileExtension: 'xlsx',
    fileHash: 'sha256:def456...',
    uploadedBy: 'user-2',
    createdAt: '2025-07-04T14:25:00Z',
    isPublic: true,
    description: 'Database performance benchmarks before and after optimization',
    metadata: {
      report_type: 'performance',
      contains_charts: true,
      benchmark_date: '2025-07-04'
    }
  }
];

/**
 * Task Collaboration Operations Class
 * Provides comprehensive collaboration functionality
 */
class TaskCollaborationOperations {

  /**
   * Create a new comment on a task
   */
  async createComment(
    taskId: string, 
    content: string, 
    userId: string,
    options: CommentOptions = {}
  ): Promise<TaskComment> {
    await simulateDelay(400);

    try {
      // Validate input
      if (!content || !content.trim()) {
        throw this.createError('VALIDATION_ERROR', 'Comment content is required');
      }

      if (content.length > TASK_CONSTANTS.MAX_COMMENT_LENGTH) {
        throw this.createError('VALIDATION_ERROR', 
          `Comment exceeds maximum length of ${TASK_CONSTANTS.MAX_COMMENT_LENGTH} characters`);
      }

      // Extract mentions from content
      const mentions = this.extractMentions(content);
      
      if (mentions.length > TASK_CONSTANTS.MAX_MENTIONS_PER_COMMENT) {
        throw this.createError('VALIDATION_ERROR', 
          `Too many mentions. Maximum ${TASK_CONSTANTS.MAX_MENTIONS_PER_COMMENT} allowed per comment`);
      }

      const now = new Date().toISOString();
      const commentId = generateId();

      const newComment: TaskComment = {
        id: commentId,
        taskId,
        userId,
        content: content.trim(),
        commentType: options.commentType || TaskCommentType.COMMENT,
        parentId: options.parentId,
        createdAt: now,
        updatedAt: now,
        isEdited: false,
        mentions: mentions.concat(options.mentions || []),
        reactions: {},
        metadata: {}
      };

      // Validate thread depth if this is a reply
      if (options.parentId) {
        const threadDepth = await this.calculateThreadDepth(options.parentId);
        if (threadDepth >= TASK_CONSTANTS.MAX_COMMENT_THREAD_DEPTH) {
          throw this.createError('VALIDATION_ERROR', 
            `Maximum thread depth of ${TASK_CONSTANTS.MAX_COMMENT_THREAD_DEPTH} reached`);
        }
      }

      mockComments.unshift(newComment);

      // Send notifications for mentions
      if (mentions.length > 0) {
        await this.sendMentionNotifications(taskId, commentId, mentions, userId);
      }

      // Emit real-time event
      this.emitCollaborationEvent('comment-created', {
        taskId,
        comment: newComment,
        mentions
      });

      return this.serializeComment(newComment);
    } catch (error) {
      if (error instanceof Error && error.message.includes('VALIDATION_ERROR')) {
        throw error;
      }
      throw this.createError('COMMENT_CREATE_FAILED', 'Failed to create comment', error);
    }
  }

  /**
   * Update an existing comment
   */
  async updateComment(
    commentId: string, 
    content: string, 
    userId: string
  ): Promise<TaskComment> {
    await simulateDelay(300);

    try {
      const commentIndex = mockComments.findIndex(c => c.id === commentId);
      if (commentIndex === -1) {
        throw this.createError('COMMENT_NOT_FOUND', `Comment ${commentId} not found`);
      }

      const comment = mockComments[commentIndex];

      // Check permission
      if (comment.userId !== userId) {
        throw this.createError('PERMISSION_ERROR', 'Only comment author can edit the comment');
      }

      // Validate content
      if (!content || !content.trim()) {
        throw this.createError('VALIDATION_ERROR', 'Comment content is required');
      }

      if (content.length > TASK_CONSTANTS.MAX_COMMENT_LENGTH) {
        throw this.createError('VALIDATION_ERROR', 
          `Comment exceeds maximum length of ${TASK_CONSTANTS.MAX_COMMENT_LENGTH} characters`);
      }

      const now = new Date().toISOString();
      const mentions = this.extractMentions(content);

      const updatedComment: TaskComment = {
        ...comment,
        content: content.trim(),
        updatedAt: now,
        isEdited: true,
        editedAt: now,
        mentions
      };

      mockComments[commentIndex] = updatedComment;

      // Send notifications for new mentions
      const newMentions = mentions.filter(mention => !comment.mentions.includes(mention));
      if (newMentions.length > 0) {
        await this.sendMentionNotifications(comment.taskId, commentId, newMentions, userId);
      }

      // Emit real-time event
      this.emitCollaborationEvent('comment-updated', {
        taskId: comment.taskId,
        comment: updatedComment
      });

      return this.serializeComment(updatedComment);
    } catch (error) {
      if (error instanceof Error && (
        error.message.includes('VALIDATION_ERROR') || 
        error.message.includes('COMMENT_NOT_FOUND') ||
        error.message.includes('PERMISSION_ERROR')
      )) {
        throw error;
      }
      throw this.createError('COMMENT_UPDATE_FAILED', 'Failed to update comment', error);
    }
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string, userId: string): Promise<void> {
    await simulateDelay(200);

    try {
      const commentIndex = mockComments.findIndex(c => c.id === commentId);
      if (commentIndex === -1) {
        throw this.createError('COMMENT_NOT_FOUND', `Comment ${commentId} not found`);
      }

      const comment = mockComments[commentIndex];

      // Check permission
      if (comment.userId !== userId) {
        throw this.createError('PERMISSION_ERROR', 'Only comment author can delete the comment');
      }

      // Check for replies
      const hasReplies = mockComments.some(c => c.parentId === commentId);
      if (hasReplies) {
        // Soft delete - mark as deleted but keep for thread integrity
        mockComments[commentIndex] = {
          ...comment,
          content: '[Comment deleted]',
          updatedAt: new Date().toISOString(),
          metadata: { ...comment.metadata, deleted: true, deletedBy: userId }
        };
      } else {
        // Hard delete
        mockComments.splice(commentIndex, 1);
      }

      // Emit real-time event
      this.emitCollaborationEvent('comment-deleted', {
        taskId: comment.taskId,
        commentId
      });
    } catch (error) {
      if (error instanceof Error && (
        error.message.includes('COMMENT_NOT_FOUND') ||
        error.message.includes('PERMISSION_ERROR')
      )) {
        throw error;
      }
      throw this.createError('COMMENT_DELETE_FAILED', 'Failed to delete comment', error);
    }
  }

  /**
   * Get comments for a task with threading
   */
  async getTaskComments(
    taskId: string, 
    includeThreads: boolean = true,
    limit: number = 50,
    offset: number = 0
  ): Promise<{
    comments: TaskComment[];
    total: number;
    hasMore: boolean;
  }> {
    await simulateDelay(300);

    try {
      let taskComments = mockComments
        .filter(c => c.taskId === taskId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      if (includeThreads) {
        // Organize comments into threads
        taskComments = this.organizeIntoThreads(taskComments);
      }

      const total = taskComments.length;
      const paginatedComments = taskComments.slice(offset, offset + limit);

      return {
        comments: paginatedComments.map(c => this.serializeComment(c)),
        total,
        hasMore: offset + limit < total
      };
    } catch (error) {
      throw this.createError('COMMENTS_FETCH_FAILED', 'Failed to fetch task comments', error);
    }
  }

  /**
   * Add reaction to a comment
   */
  async addReaction(commentId: string, reaction: string, userId: string): Promise<TaskComment> {
    await simulateDelay(200);

    try {
      const commentIndex = mockComments.findIndex(c => c.id === commentId);
      if (commentIndex === -1) {
        throw this.createError('COMMENT_NOT_FOUND', `Comment ${commentId} not found`);
      }

      const comment = mockComments[commentIndex];
      const reactions = { ...comment.reactions };

      // Add or increment reaction
      reactions[reaction] = (reactions[reaction] || 0) + 1;

      const updatedComment: TaskComment = {
        ...comment,
        reactions,
        updatedAt: new Date().toISOString()
      };

      mockComments[commentIndex] = updatedComment;

      // Emit real-time event
      this.emitCollaborationEvent('comment-reaction-added', {
        taskId: comment.taskId,
        commentId,
        reaction,
        userId
      });

      return this.serializeComment(updatedComment);
    } catch (error) {
      if (error instanceof Error && error.message.includes('COMMENT_NOT_FOUND')) {
        throw error;
      }
      throw this.createError('REACTION_ADD_FAILED', 'Failed to add reaction', error);
    }
  }

  /**
   * Remove reaction from a comment
   */
  async removeReaction(commentId: string, reaction: string, userId: string): Promise<TaskComment> {
    await simulateDelay(200);

    try {
      const commentIndex = mockComments.findIndex(c => c.id === commentId);
      if (commentIndex === -1) {
        throw this.createError('COMMENT_NOT_FOUND', `Comment ${commentId} not found`);
      }

      const comment = mockComments[commentIndex];
      const reactions = { ...comment.reactions };

      // Remove or decrement reaction
      if (reactions[reaction] && reactions[reaction] > 1) {
        reactions[reaction]--;
      } else {
        delete reactions[reaction];
      }

      const updatedComment: TaskComment = {
        ...comment,
        reactions,
        updatedAt: new Date().toISOString()
      };

      mockComments[commentIndex] = updatedComment;

      // Emit real-time event
      this.emitCollaborationEvent('comment-reaction-removed', {
        taskId: comment.taskId,
        commentId,
        reaction,
        userId
      });

      return this.serializeComment(updatedComment);
    } catch (error) {
      if (error instanceof Error && error.message.includes('COMMENT_NOT_FOUND')) {
        throw error;
      }
      throw this.createError('REACTION_REMOVE_FAILED', 'Failed to remove reaction', error);
    }
  }

  /**
   * Upload file attachment to a task
   */
  async addAttachment(
    taskId: string,
    file: File | {
      name: string;
      size: number;
      type: string;
      content: ArrayBuffer | string;
    },
    userId: string,
    description?: string,
    isPublic: boolean = false
  ): Promise<TaskAttachment> {
    await simulateDelay(800);

    try {
      // Validate file
      if (file.size > TASK_CONSTANTS.MAX_FILE_SIZE) {
        throw this.createError('FILE_TOO_LARGE', 
          `File size exceeds maximum of ${TASK_CONSTANTS.MAX_FILE_SIZE / (1024 * 1024)}MB`);
      }

      if (!TASK_CONSTANTS.ALLOWED_FILE_TYPES.includes(file.type as any)) {
        throw this.createError('INVALID_FILE_TYPE', 
          `File type ${file.type} is not allowed`);
      }

      // Check task attachment limit
      const existingAttachments = mockAttachments.filter(a => a.taskId === taskId);
      if (existingAttachments.length >= TASK_CONSTANTS.MAX_ATTACHMENTS_PER_TASK) {
        throw this.createError('ATTACHMENT_LIMIT_EXCEEDED', 
          `Maximum ${TASK_CONSTANTS.MAX_ATTACHMENTS_PER_TASK} attachments per task`);
      }

      const now = new Date().toISOString();
      const attachmentId = generateId();
      const fileExtension = this.getFileExtension(file.name);
      const filePath = `/uploads/${taskId}/${attachmentId}_${file.name}`;

      // In production, would upload to cloud storage (S3, etc.)
      const fileHash = await this.calculateFileHash(file);

      const newAttachment: TaskAttachment = {
        id: attachmentId,
        taskId,
        fileName: file.name,
        filePath,
        fileSize: file.size,
        mimeType: file.type,
        fileExtension,
        fileHash,
        uploadedBy: userId,
        createdAt: now,
        isPublic,
        description,
        metadata: {
          upload_source: 'web',
          virus_scanned: true,
          scan_result: 'clean'
        }
      };

      mockAttachments.push(newAttachment);

      // Emit real-time event
      this.emitCollaborationEvent('attachment-added', {
        taskId,
        attachment: newAttachment
      });

      return this.serializeAttachment(newAttachment);
    } catch (error) {
      if (error instanceof Error && (
        error.message.includes('FILE_TOO_LARGE') ||
        error.message.includes('INVALID_FILE_TYPE') ||
        error.message.includes('ATTACHMENT_LIMIT_EXCEEDED')
      )) {
        throw error;
      }
      throw this.createError('ATTACHMENT_UPLOAD_FAILED', 'Failed to upload attachment', error);
    }
  }

  /**
   * Remove file attachment from a task
   */
  async removeAttachment(attachmentId: string, userId: string): Promise<void> {
    await simulateDelay(300);

    try {
      const attachmentIndex = mockAttachments.findIndex(a => a.id === attachmentId);
      if (attachmentIndex === -1) {
        throw this.createError('ATTACHMENT_NOT_FOUND', `Attachment ${attachmentId} not found`);
      }

      const attachment = mockAttachments[attachmentIndex];

      // Check permission (uploader or task assignee)
      if (attachment.uploadedBy !== userId) {
        throw this.createError('PERMISSION_ERROR', 'Only uploader can delete the attachment');
      }

      // Remove from storage (in production)
      // await this.deleteFromCloudStorage(attachment.filePath);

      mockAttachments.splice(attachmentIndex, 1);

      // Emit real-time event
      this.emitCollaborationEvent('attachment-removed', {
        taskId: attachment.taskId,
        attachmentId
      });
    } catch (error) {
      if (error instanceof Error && (
        error.message.includes('ATTACHMENT_NOT_FOUND') ||
        error.message.includes('PERMISSION_ERROR')
      )) {
        throw error;
      }
      throw this.createError('ATTACHMENT_DELETE_FAILED', 'Failed to delete attachment', error);
    }
  }

  /**
   * Get attachments for a task
   */
  async getTaskAttachments(taskId: string): Promise<TaskAttachment[]> {
    await simulateDelay(200);

    try {
      const attachments = mockAttachments
        .filter(a => a.taskId === taskId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return attachments.map(a => this.serializeAttachment(a));
    } catch (error) {
      throw this.createError('ATTACHMENTS_FETCH_FAILED', 'Failed to fetch task attachments', error);
    }
  }

  /**
   * Send notification for user mentions
   */
  async mentionUser(userId: string, taskId: string, commentId: string, mentionedBy: string): Promise<void> {
    await simulateDelay(200);

    try {
      // In production, would send actual notifications (email, push, in-app)
      const notification = {
        type: 'mention',
        taskId,
        commentId,
        mentionedBy,
        userId,
        timestamp: new Date().toISOString()
      };

      // Emit real-time event
      this.emitCollaborationEvent('user-mentioned', notification);

      // Store notification (in production, would save to database)
      console.log('Mention notification sent:', notification);
    } catch (error) {
      throw this.createError('MENTION_NOTIFICATION_FAILED', 'Failed to send mention notification', error);
    }
  }

  /**
   * Get task activity history including comments and attachments
   */
  async getTaskHistory(
    taskId: string,
    includeComments: boolean = true,
    includeAttachments: boolean = true,
    limit: number = 100
  ): Promise<Array<{
    id: string;
    type: 'comment' | 'attachment' | 'system';
    timestamp: string;
    userId?: string;
    data: any;
  }>> {
    await simulateDelay(400);

    try {
      const history = [];

      if (includeComments) {
        const comments = mockComments
          .filter(c => c.taskId === taskId)
          .map(c => ({
            id: c.id,
            type: 'comment' as const,
            timestamp: c.createdAt,
            userId: c.userId,
            data: this.serializeComment(c)
          }));
        history.push(...comments);
      }

      if (includeAttachments) {
        const attachments = mockAttachments
          .filter(a => a.taskId === taskId)
          .map(a => ({
            id: a.id,
            type: 'attachment' as const,
            timestamp: a.createdAt,
            userId: a.uploadedBy,
            data: this.serializeAttachment(a)
          }));
        history.push(...attachments);
      }

      // Sort by timestamp (most recent first)
      history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return history.slice(0, limit);
    } catch (error) {
      throw this.createError('HISTORY_FETCH_FAILED', 'Failed to fetch task history', error);
    }
  }

  // Private helper methods

  private extractMentions(content: string): string[] {
    const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
    const mentions = [];
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }

    return Array.from(new Set(mentions)); // Remove duplicates
  }

  private async calculateThreadDepth(parentId: string): Promise<number> {
    let depth = 1;
    let currentParentId = parentId;

    while (currentParentId) {
      const parent = mockComments.find(c => c.id === currentParentId);
      if (!parent || !parent.parentId) break;
      
      depth++;
      currentParentId = parent.parentId;
    }

    return depth;
  }

  private organizeIntoThreads(comments: TaskComment[]): TaskComment[] {
    const topLevelComments = comments.filter(c => !c.parentId);
    const organized = [];

    for (const topComment of topLevelComments) {
      organized.push(topComment);
      // Add replies in chronological order
      const replies = this.getRepliesForComment(topComment.id, comments);
      organized.push(...replies);
    }

    return organized;
  }

  private getRepliesForComment(commentId: string, allComments: TaskComment[]): TaskComment[] {
    const directReplies = allComments
      .filter(c => c.parentId === commentId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const allReplies = [];
    for (const reply of directReplies) {
      allReplies.push(reply);
      // Recursively get nested replies
      allReplies.push(...this.getRepliesForComment(reply.id, allComments));
    }

    return allReplies;
  }

  private async sendMentionNotifications(
    taskId: string, 
    commentId: string, 
    mentions: string[], 
    mentionedBy: string
  ): Promise<void> {
    for (const userId of mentions) {
      await this.mentionUser(userId, taskId, commentId, mentionedBy);
    }
  }

  private getFileExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    return lastDotIndex > 0 ? filename.substring(lastDotIndex + 1).toLowerCase() : '';
  }

  private async calculateFileHash(file: File | { content: ArrayBuffer | string }): Promise<string> {
    // In production, would calculate actual SHA-256 hash
    // For mock purposes, return a fake hash
    return `sha256:${Math.random().toString(36).substring(2, 15)}...`;
  }

  private serializeComment(comment: TaskComment): TaskComment {
    return JSON.parse(JSON.stringify(comment));
  }

  private serializeAttachment(attachment: TaskAttachment): TaskAttachment {
    return JSON.parse(JSON.stringify(attachment));
  }

  private createError(code: string, message: string, originalError?: any): TasksError {
    const error = new Error(message) as TasksError;
    error.code = code;
    error.details = originalError;
    return error;
  }

  private emitCollaborationEvent(type: string, data: any): void {
    const event = new CustomEvent('task-collaboration-event', {
      detail: { type, timestamp: new Date().toISOString(), ...data }
    });
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(event);
      
      // Update localStorage for cross-tab synchronization
      localStorage.setItem('task_collaboration_updated', Date.now().toString());
    }
  }

  /**
   * Set typing indicator for real-time collaboration
   */
  async setTypingIndicator(taskId: string, userId: string, isTyping: boolean): Promise<void> {
    await simulateDelay(100);

    this.emitCollaborationEvent('typing-indicator', {
      taskId,
      userId,
      isTyping,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Search through task comments
   */
  async searchComments(
    taskId: string, 
    query: string, 
    limit: number = 20
  ): Promise<TaskComment[]> {
    await simulateDelay(300);

    try {
      const taskComments = mockComments.filter(c => c.taskId === taskId);
      const searchResults = taskComments.filter(comment => 
        comment.content.toLowerCase().includes(query.toLowerCase()) ||
        comment.mentions.some(mention => mention.toLowerCase().includes(query.toLowerCase()))
      );

      return searchResults
        .slice(0, limit)
        .map(c => this.serializeComment(c));
    } catch (error) {
      throw this.createError('SEARCH_FAILED', 'Failed to search comments', error);
    }
  }
}

// Export singleton instance
export const taskCollaboration = new TaskCollaborationOperations();