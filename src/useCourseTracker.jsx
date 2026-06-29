import { useState, useEffect } from 'react';
import COURSES from './courses.json';

function isSatisfied(prereqs, takenCourses) {
  if (Object.keys(prereqs).length === 0) {
    return true
  }

  if (prereqs.and) {
    return prereqs.and.every(prereq => {
      if (typeof prereq === "string") {
        return takenCourses.has(prereq)
      }
      return isSatisfied(prereq, takenCourses)
    });
  }

  if (prereqs.or) {
    return prereqs.or.some(prereq => {
      if (typeof prereq === "string") {
        return takenCourses.has(prereq);
      }
      return isSatisfied(prereq, takenCourses)
    })
  }

  return true;
}


export function useCourseTracker() {
  const [takenCourses, setTakenCourses] = useState(() => {
    const saved = localStorage.getItem('takenCourses');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  useEffect(() => {
    localStorage.setItem('takenCourses', JSON.stringify([...takenCourses]));
  }, [takenCourses]);

  const availableCourses = [];
  const lockedCourses = [];

  for (const courseId of Object.keys(COURSES)) {
    if (takenCourses.has(courseId)) continue;

    if (isSatisfied(COURSES[courseId].prereqs, takenCourses)) {
      availableCourses.push(courseId);
    } else {
      lockedCourses.push(courseId);
    }
  }

  const addCourse = (courseId) => {
    const next = new Set(takenCourses);
    next.add(courseId);
    setTakenCourses(next);
  };

  const removeCourse = (courseId) => {
    const next = new Set(takenCourses);
    const queue = [courseId];

    while (queue.length > 0) {
      const current = queue.shift();
      if (next.has(current)) {
        next.delete(current);
        for (const courseId of Object.keys(COURSES)) {
          if (!isSatisfied(COURSES[courseId].prereqs, next)) {
            queue.push(courseId);
          }
        }
      }
    }

    setTakenCourses(next);
  };

  return {takenCourses, availableCourses, lockedCourses, addCourse, removeCourse};
}