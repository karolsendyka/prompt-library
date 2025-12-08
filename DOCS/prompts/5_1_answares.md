1.  We should create a profiles table to store public user data (e.g.,
    username). This table should have a one-to-one relationship with Supabase's
    auth.users table, using the user's UUID as a primary key and foreign key. This
    approach keeps public profile information separate from sensitive authentication
    data.
2.  Create a votes table with prompt_id, user_id, and vote_value
    columns (e.g., 1 for an upvote, -1 for a downvote). A UNIQUE constraint on the
    combination of (prompt_id, user_id) will enforce the one-vote-per-user rule. The
    total score can be calculated on the fly or stored in the prompts table and updated
    with a trigger for better performance.
3.  Implement a three-table structure: a prompts table, a tags table (with
    a unique constraint on the tag name), and a prompt_tags join table to link them. This
    design efficiently handles the many-to-many relationship. For performant
    autocomplete, an index should be created on the name column of the tags table.remo
