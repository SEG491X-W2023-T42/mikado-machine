Feature: Login
    As a user,
    I want to log into the app
    so that I can use the app

    Scenario: Log in with the emulator
        Given I open the homepage
        Then I see the welcome
        Then I see the SIGN IN WITH GOOGLE button
        When I click to sign in with Google
        Then I see the auth emulator prompt
        When I click to add a new account
        Then I see an email and name form
        When I click to auto-generate the information
        Then I see that the emulator email is not blank
        When I click to sign in with the new emulator account
        Then I see a graph with edges
        Then I see the text task1 somewhere in the graph
        Then I see the text task2 somewhere in the graph
        Then I see the text task3 somewhere in the graph
