INSERT INTO freezer_user (freezer_id, user_id) VALUES
                                                   ((SELECT id FROM freezer WHERE number = '1001'), (SELECT id FROM userdb WHERE email = 'alice.johnson@example.com')),
                                                   ((SELECT id FROM freezer WHERE number = '1001'), (SELECT id FROM userdb WHERE email = 'bob.smith@example.com')),
                                                   ((SELECT id FROM freezer WHERE number = '1002'), (SELECT id FROM userdb WHERE email = 'charlie.brown@example.com')),
                                                   ((SELECT id FROM freezer WHERE number = '1002'), (SELECT id FROM userdb WHERE email = 'david.wilson@example.com')),
                                                   ((SELECT id FROM freezer WHERE number = '1003'), (SELECT id FROM userdb WHERE email = 'emma.davis@example.com')),
                                                   ((SELECT id FROM freezer WHERE number = '1003'), (SELECT id FROM userdb WHERE email = 'franklin.moore@example.com')),
                                                   ((SELECT id FROM freezer WHERE number = '1004'), (SELECT id FROM userdb WHERE email = 'grace.lee@example.com')),
                                                   ((SELECT id FROM freezer WHERE number = '1004'), (SELECT id FROM userdb WHERE email = 'henry.taylor@example.com')),
                                                   ((SELECT id FROM freezer WHERE number = '1005'), (SELECT id FROM userdb WHERE email = 'isabella.harris@example.com')),
                                                   ((SELECT id FROM freezer WHERE number = '1005'), (SELECT id FROM userdb WHERE email = 'jack.miller@example.com')),
                                                   ((SELECT id FROM freezer WHERE number = '1006'), (SELECT id FROM userdb WHERE email = 'katherine.white@example.com'));
