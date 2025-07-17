import type { Organization } from "@clerk/backend"
import { createClerkClient } from "@clerk/backend"

import { CLERK_SECRET_KEY } from "$env/static/private"

export class ClerkConnector {
  private client: ReturnType<typeof createClerkClient>

  constructor() {
    const clerkSecretKey = CLERK_SECRET_KEY

    if (!clerkSecretKey) {
      throw new Error(`CLERK_SECRET_KEY environment variable is required`)
    }

    this.client = createClerkClient({
      secretKey: clerkSecretKey,
    })
  }

  /**
   * Get the Clerk client instance for direct API access
   */
  getClient() {
    return this.client
  }

  /**
   * Authenticate a request and return auth state
   * Based on official Clerk documentation: https://clerk.com/docs/references/backend/authenticate-request
   */
  async authenticateRequest(
    request: Request,
    options?: {
      secretKey?: string
      publishableKey?: string
      authorizedParties?: string[]
    },
  ) {
    return await this.client.authenticateRequest(request, {
      secretKey: CLERK_SECRET_KEY,
      ...options,
    })
  }

  /**
   * Create a new workspace (organization)
   */
  async createWorkspace(params: {
    name: string
    slug?: string
    maxAllowedMemberships?: number
    privateMetadata?: Record<string, any>
    publicMetadata?: Record<string, any>
  }): Promise<Organization> {
    try {
      const createParams = {
        name: params.name,
        slug: params.slug,
        maxAllowedMemberships: params.maxAllowedMemberships,
        privateMetadata: params.privateMetadata,
        publicMetadata: params.publicMetadata,
      }

      const organization =
        await this.client.organizations.createOrganization(createParams)
      return organization
    } catch (error) {
      console.error("Error creating workspace:", error)
      throw new Error(
        `Failed to create workspace: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  }

  /**
   * Get workspace by ID
   */
  async getWorkspace(organizationId: string): Promise<Organization> {
    try {
      const organization = await this.client.organizations.getOrganization({
        organizationId,
      })
      return organization
    } catch (error) {
      console.error("Error fetching workspace:", error)
      throw new Error(
        `Failed to fetch workspace ${organizationId}: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  }

  /**
   * Update workspace
   */
  async updateWorkspace(
    organizationId: string,
    params: {
      name?: string
      slug?: string
      maxAllowedMemberships?: number
      privateMetadata?: Record<string, any>
      publicMetadata?: Record<string, any>
    },
  ): Promise<Organization> {
    try {
      const organization = await this.client.organizations.updateOrganization(
        organizationId,
        params,
      )
      return organization
    } catch (error) {
      console.error("Error updating workspace:", error)
      throw new Error(
        `Failed to update workspace ${organizationId}: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  }

  /**
   * Delete workspace
   */
  async deleteWorkspace(organizationId: string): Promise<void> {
    try {
      await this.client.organizations.deleteOrganization(organizationId)
    } catch (error) {
      console.error("Error deleting workspace:", error)
      throw new Error(
        `Failed to delete workspace ${organizationId}: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  }

  /**
   * List all workspaces
   */
  async listWorkspaces(params?: {
    limit?: number
    offset?: number
    includeMembersCount?: boolean
  }) {
    try {
      const organizations = await this.client.organizations.getOrganizationList(
        {
          limit: params?.limit,
          offset: params?.offset,
          includeMembersCount: params?.includeMembersCount,
        },
      )
      return organizations
    } catch (error) {
      console.error("Error listing workspaces:", error)
      throw new Error(
        `Failed to list workspaces: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  }

  /**
   * Add member to workspace
   */
  async addMemberToWorkspace(
    organizationId: string,
    userId: string,
    role: "basic_member" | "admin" = "basic_member",
  ) {
    try {
      const membership =
        await this.client.organizations.createOrganizationMembership({
          organizationId,
          userId,
          role,
        })
      return membership
    } catch (error) {
      console.error("Error adding member to workspace:", error)
      throw new Error(
        `Failed to add member to workspace: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  }

  /**
   * Remove member from workspace
   */
  async removeMemberFromWorkspace(organizationId: string, userId: string) {
    try {
      const membership =
        await this.client.organizations.deleteOrganizationMembership({
          organizationId,
          userId,
        })
      return membership
    } catch (error) {
      console.error("Error removing member from workspace:", error)
      throw new Error(
        `Failed to remove member from workspace: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  }

  /**
   * Get workspace members
   */
  async getWorkspaceMembers(
    organizationId: string,
    params?: { limit?: number; offset?: number },
  ) {
    try {
      const members =
        await this.client.organizations.getOrganizationMembershipList({
          organizationId,
          limit: params?.limit,
          offset: params?.offset,
        })
      return members
    } catch (error) {
      console.error("Error fetching workspace members:", error)
      throw new Error(
        `Failed to fetch workspace members: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  }

  /**
   * Upload logo for organization
   */
  async uploadWorkspaceLogo(
    organizationId: string,
    logoFile: File,
    uploaderUserId?: string,
  ) {
    try {
      const formData = new FormData()
      formData.append("file", logoFile)
      if (uploaderUserId) {
        formData.append("uploader_user_id", uploaderUserId)
      }

      const response = await fetch(
        `https://api.clerk.com/v1/organizations/${organizationId}/logo`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${CLERK_SECRET_KEY}`,
          },
          body: formData,
        },
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error uploading workspace logo:", error)
      throw new Error(
        `Failed to upload workspace logo: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  }

  /**
   * Create organization invitation (for adding members by email)
   */
  async inviteToWorkspace(
    organizationId: string,
    emailAddress: string,
    role: "basic_member" | "admin" = "basic_member",
  ) {
    try {
      const invitation =
        await this.client.organizations.createOrganizationInvitation({
          organizationId,
          emailAddress,
          role,
        })
      return invitation
    } catch (error) {
      console.error("Error creating workspace invitation:", error)
      throw new Error(
        `Failed to invite user to workspace: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  }

  /**
   * Bulk create organization invitations (creates individual invitations)
   */
  async bulkInviteToWorkspace(
    organizationId: string,
    invitations: Array<{
      emailAddress: string
      role: "basic_member" | "admin"
    }>,
  ) {
    try {
      const results = await Promise.allSettled(
        invitations.map((invitation) =>
          this.client.organizations.createOrganizationInvitation({
            organizationId,
            emailAddress: invitation.emailAddress,
            role: invitation.role,
          }),
        ),
      )

      return results.map((result, index) => ({
        invitation: invitations[index],
        success: result.status === "fulfilled",
        result: result.status === "fulfilled" ? result.value : result.reason,
      }))
    } catch (error) {
      console.error("Error creating bulk workspace invitations:", error)
      throw new Error(
        `Failed to bulk invite users to workspace: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  }

  /**
   * Get organization invitations
   */
  async getWorkspaceInvitations(
    organizationId: string,
    params?: { limit?: number; offset?: number },
  ) {
    try {
      const invitations =
        await this.client.organizations.getOrganizationInvitationList({
          organizationId,
          limit: params?.limit,
          offset: params?.offset,
        })
      return invitations
    } catch (error) {
      console.error("Error fetching workspace invitations:", error)
      throw new Error(
        `Failed to fetch workspace invitations: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  }
}

// Export a singleton instance
export const clerkConnector = new ClerkConnector()
