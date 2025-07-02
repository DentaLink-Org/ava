import type { TeamMember, TeamMembersResponse, TeamRole, TasksError } from '../types';

// Mock data store for development
const mockTeamMembers: TeamMember[] = [
  {
    id: 'user-1',
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    avatar: undefined,
    role: 'admin',
    isActive: true,
    joinedAt: '2025-06-15T10:00:00Z'
  },
  {
    id: 'user-2',
    name: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    avatar: undefined,
    role: 'manager',
    isActive: true,
    joinedAt: '2025-06-18T14:30:00Z'
  },
  {
    id: 'user-3',
    name: 'Michael Rodriguez',
    email: 'michael.rodriguez@example.com',
    avatar: undefined,
    role: 'member',
    isActive: true,
    joinedAt: '2025-06-22T09:15:00Z'
  },
  {
    id: 'user-4',
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    avatar: undefined,
    role: 'viewer',
    isActive: true,
    joinedAt: '2025-06-25T16:45:00Z'
  }
];

// Simulate API delay
const simulateDelay = (ms: number = 400) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Generate unique ID
const generateId = () => `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

class TeamManagement {
  private teamMembers: TeamMember[] = [...mockTeamMembers];

  // List team members
  async list(options: { includeInactive?: boolean } = {}): Promise<TeamMembersResponse> {
    await simulateDelay();

    try {
      let filteredMembers = [...this.teamMembers];

      // Filter inactive members
      if (!options.includeInactive) {
        filteredMembers = filteredMembers.filter(member => member.isActive);
      }

      // Sort by role (admin first) and then by name
      filteredMembers.sort((a, b) => {
        const roleOrder = { admin: 0, manager: 1, member: 2, viewer: 3 };
        const aOrder = roleOrder[a.role];
        const bOrder = roleOrder[b.role];
        
        if (aOrder !== bOrder) {
          return aOrder - bOrder;
        }
        
        return a.name.localeCompare(b.name);
      });

      return {
        members: filteredMembers,
        total: filteredMembers.length
      };
    } catch (error) {
      throw this.createError('FETCH_FAILED', 'Failed to fetch team members', error);
    }
  }

  // Get single team member by ID
  async get(memberId: string): Promise<TeamMember> {
    await simulateDelay(200);

    const member = this.teamMembers.find(m => m.id === memberId);
    if (!member) {
      throw this.createError('MEMBER_NOT_FOUND', `Team member with ID ${memberId} not found`);
    }

    return { ...member };
  }

  // Invite new team member
  async invite(email: string, role: TeamRole): Promise<TeamMember> {
    await simulateDelay();

    try {
      // Validate email
      if (!email?.trim()) {
        throw this.createError('VALIDATION_ERROR', 'Email is required');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        throw this.createError('VALIDATION_ERROR', 'Please enter a valid email address');
      }

      // Check for duplicate email
      const existingMember = this.teamMembers.find(m => 
        m.email.toLowerCase() === email.trim().toLowerCase()
      );
      if (existingMember) {
        if (existingMember.isActive) {
          throw this.createError('VALIDATION_ERROR', 'This person is already a team member');
        } else {
          // Reactivate existing member
          return this.updateMemberStatus(existingMember.id, true, role);
        }
      }

      // Validate role
      const validRoles: TeamRole[] = ['admin', 'manager', 'member', 'viewer'];
      if (!validRoles.includes(role)) {
        throw this.createError('VALIDATION_ERROR', 'Invalid role specified');
      }

      const now = new Date().toISOString();
      const newMember: TeamMember = {
        id: generateId(),
        name: this.extractNameFromEmail(email.trim()),
        email: email.trim().toLowerCase(),
        avatar: undefined,
        role,
        isActive: true,
        joinedAt: now
      };

      this.teamMembers.push(newMember);

      // In a real implementation, this would send an invitation email
      console.log(`Invitation sent to ${email} with role ${role}`);

      return { ...newMember };
    } catch (error) {
      if (error instanceof Error && error.message.includes('VALIDATION_ERROR')) {
        throw error;
      }
      throw this.createError('INVITE_FAILED', 'Failed to invite team member', error);
    }
  }

  // Update team member role
  async updateRole(memberId: string, newRole: TeamRole): Promise<TeamMember> {
    await simulateDelay();

    try {
      const memberIndex = this.teamMembers.findIndex(m => m.id === memberId);
      if (memberIndex === -1) {
        throw this.createError('MEMBER_NOT_FOUND', `Team member with ID ${memberId} not found`);
      }

      const member = this.teamMembers[memberIndex];

      // Validate role
      const validRoles: TeamRole[] = ['admin', 'manager', 'member', 'viewer'];
      if (!validRoles.includes(newRole)) {
        throw this.createError('VALIDATION_ERROR', 'Invalid role specified');
      }

      // Check if this is the last admin
      if (member.role === 'admin' && newRole !== 'admin') {
        const adminCount = this.teamMembers.filter(m => m.role === 'admin' && m.isActive).length;
        if (adminCount <= 1) {
          throw this.createError('VALIDATION_ERROR', 'Cannot change role of the last admin. Promote another member to admin first.');
        }
      }

      const updatedMember: TeamMember = {
        ...member,
        role: newRole
      };

      this.teamMembers[memberIndex] = updatedMember;

      return { ...updatedMember };
    } catch (error) {
      if (error instanceof Error && (error.message.includes('VALIDATION_ERROR') || error.message.includes('MEMBER_NOT_FOUND'))) {
        throw error;
      }
      throw this.createError('UPDATE_ROLE_FAILED', 'Failed to update member role', error);
    }
  }

  // Remove team member
  async remove(memberId: string): Promise<void> {
    await simulateDelay();

    try {
      const memberIndex = this.teamMembers.findIndex(m => m.id === memberId);
      if (memberIndex === -1) {
        throw this.createError('MEMBER_NOT_FOUND', `Team member with ID ${memberId} not found`);
      }

      const member = this.teamMembers[memberIndex];

      // Check if this is the last admin
      if (member.role === 'admin') {
        const adminCount = this.teamMembers.filter(m => m.role === 'admin' && m.isActive).length;
        if (adminCount <= 1) {
          throw this.createError('VALIDATION_ERROR', 'Cannot remove the last admin. Promote another member to admin first.');
        }
      }

      // Mark as inactive instead of deleting to preserve data integrity
      this.teamMembers[memberIndex] = {
        ...member,
        isActive: false
      };
    } catch (error) {
      if (error instanceof Error && (error.message.includes('VALIDATION_ERROR') || error.message.includes('MEMBER_NOT_FOUND'))) {
        throw error;
      }
      throw this.createError('REMOVE_FAILED', 'Failed to remove team member', error);
    }
  }

  // Update member profile
  async updateProfile(memberId: string, updates: { name?: string; avatar?: string }): Promise<TeamMember> {
    await simulateDelay();

    try {
      const memberIndex = this.teamMembers.findIndex(m => m.id === memberId);
      if (memberIndex === -1) {
        throw this.createError('MEMBER_NOT_FOUND', `Team member with ID ${memberId} not found`);
      }

      // Validate updates
      if (updates.name !== undefined) {
        if (!updates.name.trim()) {
          throw this.createError('VALIDATION_ERROR', 'Name cannot be empty');
        }
        updates.name = updates.name.trim();
      }

      const currentMember = this.teamMembers[memberIndex];
      const updatedMember: TeamMember = {
        ...currentMember,
        ...updates,
        id: memberId // Ensure ID doesn't change
      };

      this.teamMembers[memberIndex] = updatedMember;

      return { ...updatedMember };
    } catch (error) {
      if (error instanceof Error && (error.message.includes('VALIDATION_ERROR') || error.message.includes('MEMBER_NOT_FOUND'))) {
        throw error;
      }
      throw this.createError('UPDATE_PROFILE_FAILED', 'Failed to update member profile', error);
    }
  }

  // Get team statistics
  async getStats(): Promise<{
    total: number;
    active: number;
    byRole: Record<TeamRole, number>;
  }> {
    await simulateDelay(200);

    try {
      const activeMembers = this.teamMembers.filter(m => m.isActive);
      
      const byRole = activeMembers.reduce((acc, member) => {
        acc[member.role] = (acc[member.role] || 0) + 1;
        return acc;
      }, {} as Record<TeamRole, number>);

      // Ensure all roles are represented
      const allRoles: TeamRole[] = ['admin', 'manager', 'member', 'viewer'];
      allRoles.forEach(role => {
        if (!byRole[role]) byRole[role] = 0;
      });

      return {
        total: this.teamMembers.length,
        active: activeMembers.length,
        byRole
      };
    } catch (error) {
      throw this.createError('STATS_FAILED', 'Failed to get team statistics', error);
    }
  }

  // Private helper methods
  private extractNameFromEmail(email: string): string {
    const localPart = email.split('@')[0];
    return localPart
      .split(/[._-]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }

  private async updateMemberStatus(memberId: string, isActive: boolean, newRole?: TeamRole): Promise<TeamMember> {
    const memberIndex = this.teamMembers.findIndex(m => m.id === memberId);
    if (memberIndex === -1) {
      throw this.createError('MEMBER_NOT_FOUND', `Team member with ID ${memberId} not found`);
    }

    const currentMember = this.teamMembers[memberIndex];
    const updatedMember: TeamMember = {
      ...currentMember,
      isActive,
      role: newRole || currentMember.role,
      joinedAt: isActive ? new Date().toISOString() : currentMember.joinedAt
    };

    this.teamMembers[memberIndex] = updatedMember;
    return { ...updatedMember };
  }

  private createError(code: string, message: string, originalError?: any): TasksError {
    const error = new Error(message) as TasksError;
    error.code = code;
    error.details = originalError;
    return error;
  }
}

// Export singleton instance
export const teamManagement = new TeamManagement();