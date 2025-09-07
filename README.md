# Campus Event Management Platform :
The platform is MERN stack application , and based on the assignment , the Admin page is web based and thus, 
uses React.js while the Student page is app based  and uses Ract Native .
The inspiration for the app compes from a combination of Luma events and Salesforce.

I started off by planning to build this project using PostgresSql with Docker containerization , with python
backend , which after few hours of trying I understood that it was not possible because of too many bugs ,
And from my personal experience if something does not work then take a step back and re iterate.
So, later I switched to MERN based tech stack for faster prototyping , Once the basic prototype was ready , 
I went ahead and added more features like serching, filters, feedback, analytics for better privacy , usability and more 
detailed usage by convesing with AI about different scenerios.



## Rough Ideation :
- **Initial** :
![WhatsApp Image 2025-09-07 at 14 48 51_a093a2a5](https://github.com/user-attachments/assets/7fbe74b5-e800-4735-8dab-3c50fecce088)

- **Final** :
![WhatsApp Image 2025-09-07 at 14 48 50_e8f0cd1b](https://github.com/user-attachments/assets/20bbefbd-62d2-46c8-accc-4356b1f90a2c)



## AI Conversation LOG : https://chatgpt.com/share/68bd4aa7-bd2c-8007-9788-f8c90de33fc2


## Architechture :
- Backend API : Node.js + Express.js + MongoDB REST API
- Admin Portal : React.js with Tailwind CSS
- Student App : React Native mobile application with Expo



## The types of users :
- The platform has three types of users **Super Admin** , **College Admin** , **Student**.
- The **Super Admin** can create/delete Colleges and their admins.
- The **College Admin** can create/delete Students , events , mark attendence , view event analytics , 
view student analytics(only students who belong to their college) , view feedback and ratings of events , etc.



## Reports/Outputs :
- **Real-time statistics**
- **Event Analytics**
- **Student Paticipation Reports**
- **Attendace Reports**
- **Feedback and it's analytics**



##Credentils :
- **Super Admin**: Email: superadmin@campus-events.com / Password: superadmin123

- **College Admin**:
Tech University: admin@techuniversity.edu / admin123
Business College: admin@businesscollege.edu / admin123
Arts Institute: admin@artsinstitute.edu / admin123

- **Students** :
Tech University:
- john.doe@student.techuniversity.edu / student123
- jane.smith@student.techuniversity.edu / student123

Business College:
- mike.johnson@student.businesscollege.edu / student123
- sarah.wilson@student.businesscollege.edu / student123

Arts Institute:
- david.brown@student.artsinstitute.edu / student123
- emma.davis@student.artsinstitute.edu / student123




## To Run the App :
-**Backend** :
cd backend
npm run dev

-**Admin Frontend** :
cd admin-portal
npm start

-**Mobile app** :
cd student-app
npm start






# Screen Shots
<img width="1910" height="927" alt="Screenshot 2025-09-07 150957" src="https://github.com/user-attachments/assets/bb3f243f-2184-4f8f-a361-fcf2406b334e" />
<img width="1907" height="924" alt="Screenshot 2025-09-07 151004" src="https://github.com/user-attachments/assets/1a1d515e-8e91-41d3-a0b9-d7fcc9444c26" />
<img width="1913" height="925" alt="Screenshot 2025-09-07 151011" src="https://github.com/user-attachments/assets/62433b87-2ffb-4d8f-883a-d21a7d766c26" />
<img width="1894" height="925" alt="Screenshot 2025-09-07 151020" src="https://github.com/user-attachments/assets/529d0a50-4679-456f-8194-b66303680631" />
<img width="1913" height="923" alt="Screenshot 2025-09-07 151047" src="https://github.com/user-attachments/assets/bbedb8ed-aedc-4ab8-b4db-38d6ec3719bf" />
<img width="1908" height="920" alt="Screenshot 2025-09-07 151102" src="https://github.com/user-attachments/assets/e9f81f42-5e4c-4afc-a222-a5a9ec719dd0" />
<img width="1919" height="868" alt="Screenshot 2025-09-07 151113" src="https://github.com/user-attachments/assets/a9837093-0e6f-4070-8815-60a0d0f1314e" />
<img width="1919" height="918" alt="Screenshot 2025-09-07 151121" src="https://github.com/user-attachments/assets/992302b4-604c-4b38-929a-f64ceeee403e" />
<img width="1896" height="922" alt="Screenshot 2025-09-07 151131" src="https://github.com/user-attachments/assets/e83b9b1d-2300-4883-a816-9f8318fee800" />
<img width="1891" height="927" alt="Screenshot 2025-09-07 150944" src="https://github.com/user-attachments/assets/f728ae0f-967b-4bfc-b0a0-f9f4bcc29a7d" />

