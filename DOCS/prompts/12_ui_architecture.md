1.there shouldn't be dedicated home page.1st page displayed after signing in should be a list of prompts. 
2. Yes, we should implement a dedicated “Prompt Details” screen backed by GET /prompts/{id}, where entering the page triggers a “view” analytics event and exposes actions for vote, flag, and copy.
3. no "my prompts" for now
4. Yes, we should design full-page “Create Prompt” and “Edit Prompt” views that map closely to POST /prompts and PUT /prompts/{id}, and include tag autocomplete backed by GET /tags.
5. navigation should contain only two elements list of prompts and button to create new prompt. profile should be disoplayed in top bar and represented only by login 
6.  Yes, we should adopt a mobile-first responsive design where search and filters collapse into drawers or accordions on small screens, grids adapt to single-column lists, and interaction targets meet touch guidelines.
7. Yes, all interactive components should be implemented using accessible patterns (e.g., shadcn/ui primitives where possible), including focus management, ARIA roles for dialogs/menus, and clear text or icon+label for actions like upvote/downvote and flag.
8. Public action is only sign in and sign up pages. List and prompt creation are hidden behind authentication. unauthenticated users are redirected to login/registration before calling protected APIs, showing clear error messages on 401/403. Authentication mechanism will be implemented later
9. We should use a predictable data-fetching and caching strategy (e.g., React query-style hooks or a lightweight store) to keep prompt lists and details in sync, optimistically update vote scores and tag selections, and refetch as needed after mutations.
10. We should standardize loading skeletons/spinners, inline validation and error banners for failed requests (400/422), confirmation dialogs for destructive actions, debounced search requests to GET /prompts, and paginated infinite or numbered navigation using limit/offset, with simple client-side caching of recent queries.
------
You are an AI assistant whose task is to summarize the conversation about UI architecture planning for MVP and prepare a concise summary for the next stage of development. In the conversation history you will find the following information:
1. Product Requirements Document (PRD)
2. Tech stack information
3. API plan
4. Conversation history containing questions and answers
5. UI architecture recommendations

Your task is to:
1. Summarize the conversation history, focusing on all decisions related to UI architecture planning.
2. Match the model's recommendations to the answers given in the conversation history. Identify which recommendations are relevant based on the discussion.
3. Prepare a detailed conversation summary that includes:
   a. Main UI architecture requirements
   b. Key views, screens, and user flows
   c. API integration and state management strategy
   d. Responsiveness, accessibility, and security considerations
   e. Any unresolved issues or areas requiring further clarification
4. Format the results in the following way:

<conversation_summary>
<decisions>
[List decisions made by the user, numbered].
</decisions>
<matched_recommendations>
[List of the most relevant recommendations matched to the conversation, numbered]
</matched_recommendations>
<ui_architecture_planning_summary>
[Provide a detailed conversation summary, including the elements listed in step 3].
</ui_architecture_planning_summary>
<unresolved_issues>
[List any unresolved issues or areas requiring further clarification, if any exist]
</unresolved_issues>
</conversation_summary>

The final output should contain only content in markdown format. Ensure your summary is clear, concise, and provides valuable information for the next stage of UI architecture planning and API integration.


