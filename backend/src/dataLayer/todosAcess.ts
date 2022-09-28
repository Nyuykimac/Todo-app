import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

import QueryInput = DocumentClient.QueryInput;
import PutItemInput = DocumentClient.PutItemInput;
import UpdateItemInput = DocumentClient.UpdateItemInput;
import DeleteItemInput = DocumentClient.DeleteItemInput;

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

const dbClient: DocumentClient = new XAWS.DynamoDB.DocumentClient();
const todoTable = process.env.TODOS_TABLE

// function to get todo item per user
export async function getTodoItemsPerUser(userId:string): Promise<TodoItem[]> {
    logger.info('Fetching todos for user: ' + userId)

    const params: QueryInput = {
        TableName: todoTable,
        IndexName: process.env.TODOS_CREATED_AT_INDEX,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValue: {
            ':userId': userId
        }
    }

    const result = await dbClient.query(params).promise()
    const todoItems = result.Items as TodoItem[]
    logger.info('Returning todos: ' + todoItems)
    return todoItems
}

// function to create todo item
export async function createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
    const params : PutItemInput = {
        TableName: todoTable,
        Item: todoItem
    }

    await dbClient.put(params).promise()
    return todoItem
}

// function to update todo item
export async function updateTodoItem(userId:string, todoId: string, todoUpdate: TodoUpdate): Promise<TodoItem> {
    const params: UpdateItemInput = {
        TableName: todoTable,
        Key: {
            userId: userId,
            todoId: todoId
        },
        ExpressionAttributrNames: {
            "#N": "name"
        },
        UpdateExpression: "set #N = :todoName, dueDate = :dueDate, done =:done",
        ExpressionAttributeValues: {
            ":todoName": todoUpdate.name,
            ":dueDate": todoUpdate.dueDate,
            ":done": todoUpdate.done
        },
        ReturnValues: "ALL_NEW"
    }

    const updatedTodoItem = await dbClient.update(params).promise()
    return updatedTodoItem.Attributes as TodoItem
}

// function to delete todo item
export async function deleteTodoItem(userId: string, todoId: string): Promise<void> {
    const params: DeleteItemInput = {
        TableName: todoTable,
        Key: {
            userId: userId,
            todoId: todoId
        }
    }

    await dbClient.delete(params).promise()
}

// function to update attachment url
export async function updateAttachmentUrl(userId: string, todoId: string, attachmentUrl: string): Promise<void> {
    await dbClient.update({
        TableName: todoTable,
        Key: {
            userId,
            todoId
        },
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
            ':attachmentUrl': attachmentUrl
        }
    }).promise()
}