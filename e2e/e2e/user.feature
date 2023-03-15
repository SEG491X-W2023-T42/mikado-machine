Feature: Data Submission
    As a user,
    I want to provide feedback on the website
    so that I can make my voice heard

    Scenario: Go through the survey
        Given I visit the page
        Then I see the footer
        Then I do not see section 2
        Then I do not see section 3
        Then I do not see section 4
        Then I do not see section 5
        Then I do not see section 6
        Then I do not see section 1
        When I click to go to section 1
        Then I see section 1
        Then I do not see section 2
        When I click to go to section 2
        Then I see section 2
        Then I do not see section 3
        When I click to go to section 3
        Then I see section 3
        Then I do not see section 4
        When I click to go to section 4
        Then I see section 4
        Then I do not see section 5
        When I click to go to section 5
        Then I see section 5
        Then I do not see section 6
        When I click to go to section 6
        Then I see section 6
        Then I do not see section 0
        Then I do not see section 1
        Then I do not see section 2
        Then I do not see section 3
        Then I do not see section 4
        Then I do not see section 5
