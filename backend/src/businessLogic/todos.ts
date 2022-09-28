import { getTodoItemsPerUser, createTodoItem, deleteTodoItem, updateTodoItem, updateAttachmentUrl } from '../dataLayer/todosAcess';
import { getAttachmentBucketUrl, createAttachmentPresignedUrl } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'
// import { getUserId } from '../lambda/utils';

const logger = createLogger('todos')

// gets all to do items
export async function getAllTodoForUser(userId:string): Promise<TodoItem[]> {
    return getTodoItemsPerUser(userId)
}

// creates to-do items
export async function createTodo(userId:string, createTodoRequest: CreateTodoRequest): Promise<TodoItem> {
    const todoId = uuid.v4();

    const newTodo : TodoItem = {
        todoId: todoId,
        userId: userId,
        createdAt: new Date().toISOString(),
        done: false,
        ...createTodoRequest
    }

    logger.info('Creating new Todo item: ' + newTodo)
    return createTodoItem(newTodo);
}

// deletes to-dos
export async function deleteTodo(userId:string, todoId:string): Promise<void> {
    logger.info('Delete Todo item: ', {userId: userId, todoId: todoId})
    return deleteTodoItem(userId, todoId)
}

// creates attachment url for file being uploaded
export async function createUploadUrl(attachmentId: string): Promise<string> {
    logger.info('Create a pre-signed url for Todo item id: ' + attachmentId)
    const newUrl = createAttachmentPresignedUrl(attachmentId)
    logger.info('Uploading URL: ' + newUrl)
    return newUrl;
}

// updates url to item
export async function addAttachmentToItem(userId: string, todoId: string, attachmentId: string): Promise<void> {
    const attachmentUrl = getAttachmentBucketUrl(attachmentId);
    logger.info('Getting attachment URL: ' + attachmentUrl)
    await updateAttachmentUrl(userId, todoId, attachmentUrl)
}