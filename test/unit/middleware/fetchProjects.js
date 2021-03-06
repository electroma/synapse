import { takeEvery } from 'redux-saga';
import { put, call } from 'redux-saga/effects';

import Api from 'api';
import {
  receiveProjects,
  setErrorMessage,
  startXHR,
  endXHR,
} from 'actions';
import { FETCH_PROJECTS } from 'actions/actions';
import {
  fetchProjects,
  watchFetchProjects,
} from 'middleware/project';
import {
  fetchProject,
  fetchProjectDemandData,
} from 'middleware/api';
import getRagStatus from 'helpers/getRagStatus';

import { expect } from 'chai';

describe('All projects fetcher', () => {
  const errorMessage = 'an error message';
  const project1 = { name: 'P001', projection: {} };
  const projects = [project1];
  const demand = [];
  const generator = fetchProjects();
  const errorGenerator = fetchProjects();

  it('marks as xhr running', () => {
    expect(generator.next().value).to.deep.equal(put(startXHR()));
  });

  it('retrieves project summary data', () => {
    expect(generator.next().value).to.deep.equal(call(Api.projects));
  });

  it('retrieves individual project data for each project', () => {
    expect(generator.next(projects).value).to.deep.equal(call(fetchProject, project1.name));
  });

  it('retrieves demand status data for each project', () => {
    expect(
      generator.next(project1).value).to.deep.equal(call(fetchProjectDemandData, project1.name));
  });

  it('calculates the rag status for each project', () => {
    expect(
      generator.next(demand).value).to.deep.equal(call(getRagStatus, project1.projection, demand));
  });

  it('issues an action', () => {
    expect(generator.next(projects).value).to.deep.equal(put(receiveProjects(projects)));
  });

  it('displays an error message', () => {
    errorGenerator.next();

    const message = put(setErrorMessage(errorMessage));
    expect(errorGenerator.throw(errorMessage).value).to.deep.equal(message);

    errorGenerator.next();
  });
  it('displays a deep error message', () => {
    const errorGenerator2 = fetchProjects();
    const correct = put(setErrorMessage(errorMessage));
    errorGenerator2.next();
    errorGenerator2.next();
    errorGenerator2.next(projects);
    errorGenerator2.next(project1);

    expect(errorGenerator2.throw(errorMessage).value).to.deep.equal(correct);
  });

  it('marks as xhr finished', () => {
    expect(generator.next().value).to.deep.equal(put(endXHR()));
  });

  it('finishes', () => {
    expect(generator.next().done).to.equal(true);
    expect(errorGenerator.next().done).to.equal(true);
  });

  it('watches', () => {
    const watchGenerator = watchFetchProjects();
    const correct = call(takeEvery, FETCH_PROJECTS, fetchProjects);
    expect(watchGenerator.next().value).to.deep.equal(correct);
  });
});
