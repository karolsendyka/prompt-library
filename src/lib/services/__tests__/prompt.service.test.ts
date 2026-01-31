import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PromptService } from '../prompt.service';
import { PromptRepository } from '../../repositories/prompt.repository';
import type { SupabaseClient } from '../../../db/supabase.client';
import type { Database } from '../../../db/database.types';
import type { CreatePromptCommand, CreatedPromptDto, PaginationDTO, PromptDetailDTO, PromptListDTO } from '../../../types';

// Mock SupabaseClient
const mockSupabaseClient: SupabaseClient<Database> = {} as SupabaseClient<Database>;

// Mock PromptRepository instance
const mockPromptRepositoryInstance = {
  createPromptWithTags: vi.fn(),
  getPromptById: vi.fn(),
  upsertVoteAndGetScore: vi.fn(),
  softDeletePromptIfOwner: vi.fn(),
  listPrompts: vi.fn(),
};

// Use a factory function within vi.mock to return a mock class
vi.mock('../../repositories/prompt.repository', () => {
  class MockPromptRepository {
    constructor(supabaseClient: any) {
      // Assign the mocked methods to this instance
      Object.assign(this, mockPromptRepositoryInstance);
    }
  }
  return {
    PromptRepository: MockPromptRepository,
  };
});

describe('PromptService', () => {
  let promptService: PromptService;

  beforeEach(() => {
    // Clear mocks on the instance that PromptService receives
    vi.clearAllMocks();
    promptService = new PromptService(mockSupabaseClient);
  });

  describe('createPrompt', () => {
    const mockCommand: CreatePromptCommand = {
      title: 'Test Prompt',
      description: 'A test description',
      content: 'Test content here',
      tags: ['tag1', 'tag2'],
    };
    const mockAuthorId = 'test-author-id';
    const mockNewPrompt = {
      id: 'new-prompt-id',
      author_id: mockAuthorId,
      title: mockCommand.title,
      description: mockCommand.description,
      content: mockCommand.content,
      tags: mockCommand.tags,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    it('should successfully create a new prompt', async () => {
      // Arrange
      mockPromptRepositoryInstance.createPromptWithTags.mockResolvedValueOnce(mockNewPrompt);

      // Act
      const result = await promptService.createPrompt(mockCommand, mockAuthorId);

      // Assert
      expect(mockPromptRepositoryInstance.createPromptWithTags).toHaveBeenCalledWith(
        {
          title: mockCommand.title,
          description: mockCommand.description,
          content: mockCommand.content,
          author_id: mockAuthorId,
        },
        mockCommand.tags
      );
      expect(result).toEqual({
        id: mockNewPrompt.id,
        author_id: mockNewPrompt.author_id,
        title: mockNewPrompt.title,
        description: mockNewPrompt.description,
        content: mockNewPrompt.content,
        tags: mockNewPrompt.tags,
        vote_score: 0,
        created_at: mockNewPrompt.created_at,
        updated_at: mockNewPrompt.updated_at,
      } as CreatedPromptDto);
    });

    it('should throw an error if prompt creation fails in the repository', async () => {
      // Arrange
      mockPromptRepositoryInstance.createPromptWithTags.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(promptService.createPrompt(mockCommand, mockAuthorId)).rejects.toThrow('Failed to create prompt.');
    });
  });

  describe('getPrompt', () => {
    const mockPromptId = 'test-prompt-id';
    const mockUserId = 'test-user-id';
    const mockPromptDetail: PromptDetailDTO = {
      id: mockPromptId,
      author_id: 'some-author',
      title: 'Detail Prompt',
      description: 'Detail description',
      content: 'Detail content',
      tags: ['detail'],
      vote_score: 5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      has_voted: true,
    };

    it('should return a prompt when found', async () => {
      // Arrange
      mockPromptRepositoryInstance.getPromptById.mockResolvedValueOnce(mockPromptDetail);

      // Act
      const result = await promptService.getPrompt(mockPromptId, mockUserId);

      // Assert
      expect(mockPromptRepositoryInstance.getPromptById).toHaveBeenCalledWith(mockPromptId, mockUserId);
      expect(result).toEqual(mockPromptDetail);
    });

    it('should return null when prompt is not found', async () => {
      // Arrange
      mockPromptRepositoryInstance.getPromptById.mockResolvedValueOnce(null);

      // Act
      const result = await promptService.getPrompt(mockPromptId, mockUserId);

      // Assert
      expect(mockPromptRepositoryInstance.getPromptById).toHaveBeenCalledWith(mockPromptId, mockUserId);
      expect(result).toBeNull();
    });
  });

  describe('processVote', () => {
    const mockPromptId = 'prompt-for-vote';
    const mockUserId = 'user-voting';
    const mockNewScore = 10;

    it('should successfully process a vote and return the new score', async () => {
      // Arrange
      mockPromptRepositoryInstance.upsertVoteAndGetScore.mockResolvedValueOnce(mockNewScore);

      // Act
      const result = await promptService.processVote(mockPromptId, mockUserId, 1);

      // Assert
      expect(mockPromptRepositoryInstance.upsertVoteAndGetScore).toHaveBeenCalledWith(mockPromptId, mockUserId, 1);
      expect(result).toEqual({ new_vote_score: mockNewScore });
    });

    it('should throw an error if userId is not provided', async () => {
      // Act & Assert
      await expect(promptService.processVote(mockPromptId, '', 1)).rejects.toThrow('User not authenticated.');
    });

    it('should throw an error if repository fails to process vote', async () => {
      // Arrange
      mockPromptRepositoryInstance.upsertVoteAndGetScore.mockRejectedValueOnce(new Error('DB Error'));

      // Act & Assert
      await expect(promptService.processVote(mockPromptId, mockUserId, 1)).rejects.toThrow('DB Error');
    });
  });

  describe('deletePrompt', () => {
    const mockPromptId = 'prompt-to-delete';
    const mockUserId = 'owner-id';

    it('should successfully delete a prompt if user is owner', async () => {
      // Arrange
      mockPromptRepositoryInstance.softDeletePromptIfOwner.mockResolvedValueOnce(true);

      // Act
      await expect(promptService.deletePrompt(mockPromptId, mockUserId)).resolves.toBeUndefined();

      // Assert
      expect(mockPromptRepositoryInstance.softDeletePromptIfOwner).toHaveBeenCalledWith(mockPromptId, mockUserId);
    });

    it('should throw an error if userId is not provided', async () => {
      // Act & Assert
      await expect(promptService.deletePrompt(mockPromptId, '')).rejects.toThrow('User not authenticated.');
    });

    it('should throw an error if prompt is not found or user is not authorized', async () => {
      // Arrange
      mockPromptRepositoryInstance.softDeletePromptIfOwner.mockResolvedValueOnce(false);

      // Act & Assert
      await expect(promptService.deletePrompt(mockPromptId, mockUserId)).rejects.toThrow(
        'Prompt not found or user not authorized to delete this prompt.'
      );
    });

    it('should throw an error if repository fails to delete', async () => {
      // Arrange
      mockPromptRepositoryInstance.softDeletePromptIfOwner.mockRejectedValueOnce(new Error('DB Error'));

      // Act & Assert
      await expect(promptService.deletePrompt(mockPromptId, mockUserId)).rejects.toThrow('DB Error');
    });
  });

  describe('listPrompts', () => {
    const mockQuery = {
      page: 1,
      pageSize: 10,
      sortBy: 'created_at',
      sortOrder: 'desc',
    };
    const mockPromptList: PromptListDTO[] = [
      {
        id: '1',
        title: 'Prompt 1',
        description: 'Desc 1',
        vote_score: 5,
        tags: ['tagA'],
        created_at: new Date().toISOString(),
        author_id: 'author1',
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Prompt 2',
        description: 'Desc 2',
        vote_score: 3,
        tags: ['tagB'],
        created_at: new Date().toISOString(),
        author_id: 'author2',
        updated_at: new Date().toISOString(),
      },
    ];
    const mockPagination: PaginationDTO = {
      currentPage: 1,
      pageSize: 10,
      totalItems: 2,
      totalPages: 1,
    };

    it('should return a list of prompts with pagination data', async () => {
      // Arrange
      mockPromptRepositoryInstance.listPrompts.mockResolvedValueOnce({
        data: mockPromptList,
        pagination: mockPagination,
      });

      // Act
      const result = await promptService.listPrompts(mockQuery);

      // Assert
      expect(mockPromptRepositoryInstance.listPrompts).toHaveBeenCalledWith(mockQuery);
      expect(result.data).toEqual(mockPromptList);
      expect(result.pagination).toEqual(mockPagination);
    });

    it('should return empty data and correct pagination for no prompts', async () => {
      // Arrange
      mockPromptRepositoryInstance.listPrompts.mockResolvedValueOnce({
        data: [],
        pagination: { ...mockPagination, totalItems: 0, totalPages: 0 },
      });

      // Act
      const result = await promptService.listPrompts(mockQuery);

      // Assert
      expect(mockPromptRepositoryInstance.listPrompts).toHaveBeenCalledWith(mockQuery);
      expect(result.data).toEqual([]);
      expect(result.pagination).toEqual({ ...mockPagination, totalItems: 0, totalPages: 0 });
    });

    it('should throw an error if repository fails to list prompts', async () => {
      // Arrange
      mockPromptRepositoryInstance.listPrompts.mockRejectedValueOnce(new Error('DB Error'));

      // Act & Assert
      await expect(promptService.listPrompts(mockQuery)).rejects.toThrow('DB Error');
    });
  });
});