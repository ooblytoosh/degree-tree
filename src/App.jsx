import COURSES from './COURSES.json';
import {useEffect, useState} from 'react';
import './App.css';

function CourseCard({courseId, status, onClick}) {
  const course = COURSES[courseId];

  return (
    <div className={`course-card ${status}`} onClick={onClick}>
      <p className='courseId'>{courseId}</p>
      <p className='courseTitle'>{course.name}</p>
      <p className='status'>Status: {status}</p>
      <p className='prereqs'>Prereqs: {course.prereqs.length > 0 ? course.prereqs.join(', ') : "None"}</p>
    </div>
  )
}

function App() {
  const [takenCourses, setTakenCourses] = useState(() => {
    const saved = localStorage.getItem('takenCourses');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
 
  useEffect(() => {
    localStorage.setItem('takenCourses', JSON.stringify([...takenCourses]));
  }, [takenCourses])

  const availableCourses = [];
  const lockedCourses = [];

  for (const courseId of Object.keys(COURSES)) {
    if (takenCourses.has(courseId)) {
      continue
    }

    if (COURSES[courseId].prereqs.every(prereq => takenCourses.has(prereq))) {
      availableCourses.push(courseId);
    } else {
      lockedCourses.push(courseId);
    }
  }

  const handleRemoveCourse = courseId => {
    const next = new Set(takenCourses);
    const queue = [courseId];

    while (queue.length > 0) {
      const current = queue.shift();

      if (next.has(current)) {
        next.delete(current);
      }

      Object.keys(COURSES).forEach(id => {
        if (COURSES[id].prereqs.includes(current)) {
          queue.push(id);
        }
      })
    }

    setTakenCourses(next);
  }

  return (
    <div>
      <h1>prereqd</h1>
      <div className="lists">
        <div className="taken">
          <h2>Taken: {takenCourses.size}</h2>
          {[...takenCourses].map(courseId => 
            <CourseCard key={courseId} courseId={courseId} status='taken' onClick={() => handleRemoveCourse(courseId)}/>
          )}
        </div>
        <div>
          <h2>Available: {availableCourses.length}</h2>
          {[...availableCourses].map(courseId => 
            <CourseCard key={courseId} courseId={courseId} status='available' onClick={() => setTakenCourses(new Set([...takenCourses, courseId]))}/>
          )}
        </div>
        <div>
          <h2>Locked: {lockedCourses.length}</h2>
          {[...lockedCourses].map(courseId => 
            <CourseCard key={courseId} courseId={courseId} status='locked' />
          )}
        </div>
      </div>
    </div>
  )
}

export default App