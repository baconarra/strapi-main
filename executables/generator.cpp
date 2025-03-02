#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <Windows.h>
#include <unistd.h>

#define AUTH_FILE "AUTH"
#define DEFAULT_URL "http://localhost:1337/api"
#define BUFFER_SIZE 1024

void read_auth_key(char *auth_key) {
    FILE *auth_file = fopen(AUTH_FILE, "r");
    if (!auth_file) {
        fprintf(stderr, "Error: AUTH file does not exist.\n");
        exit(EXIT_FAILURE);
    }

    if (!fgets(auth_key, BUFFER_SIZE, auth_file)) {
        fprintf(stderr, "Error: AUTH file is empty.\n");
        fclose(auth_file);
        exit(EXIT_FAILURE);
    }

    strtok(auth_key, "\n"); // Remove newline character if present
    fclose(auth_file);
}

void get_input(const char *prompt, char *buffer, size_t size, const char *default_value) {
    printf("%s", prompt);
    fgets(buffer, size, stdin);

    if (buffer[0] == '\n' && default_value) {
        strncpy(buffer, default_value, size);
    } else {
        strtok(buffer, "\n"); // Remove newline character
    }
}

void validate_not_empty(const char *field_name, const char *value) {
    if (strlen(value) == 0) {
        fprintf(stderr, "Error: %s cannot be empty.\n", field_name);
        exit(EXIT_FAILURE);
    }
}

void execute_curl_command(const char *command, int *response_code) {
    char full_command[BUFFER_SIZE];
    snprintf(full_command, BUFFER_SIZE, "%s -w \"%%{http_code}\" -o temp_response.txt", command);

    FILE *response_file;
    int result = system(full_command);
    if (result != 0) {
        fprintf(stderr, "Error: Failed to execute curl command.\n");
        exit(EXIT_FAILURE);
    }

    response_file = fopen("temp_response.txt", "r");
    if (response_file) {
        fscanf(response_file, "%d", response_code);
        fclose(response_file);
        // Delete temp_response.txt after reading
        if (remove("temp_response.txt") != 0) {
            fprintf(stderr, "Warning: Unable to delete temp_response.txt.\n");
        }
    } else {
        fprintf(stderr, "Error: Unable to read response code.\n");
        exit(EXIT_FAILURE);
    }
}

int main() {
    char auth_key[BUFFER_SIZE];
    char api_url[BUFFER_SIZE];
    char company_name[BUFFER_SIZE];
    char company_email[BUFFER_SIZE];
    char password[BUFFER_SIZE];

    read_auth_key(auth_key);

    get_input("Enter API URL (default: http://localhost:1337/api): ", api_url, BUFFER_SIZE, DEFAULT_URL);

    get_input("Enter Company Name: ", company_name, BUFFER_SIZE, NULL);
    validate_not_empty("Company Name", company_name);

    get_input("Enter Company Email: ", company_email, BUFFER_SIZE, NULL);
    validate_not_empty("Company Email", company_email);

    get_input("Enter Password: ", password, BUFFER_SIZE, NULL);
    validate_not_empty("Password", password);
    
    char generate_company_content_command[BUFFER_SIZE];
    snprintf(generate_company_content_command, BUFFER_SIZE,
             "curl -X POST -H \"Authorization: Bearer %s\" -H \"Content-Type: application/json\" "
             "-d \"{\\\"company-name\\\": \\\"%s\\\", \\\"company-email\\\": \\\"%s\\\"}\" %s/generate/company-content",
             auth_key, company_name, company_email, api_url);

    int response_code;
    execute_curl_command(generate_company_content_command, &response_code);

    if (response_code != 200 && response_code != 0) {
        fprintf(stderr, "Error: Failed to generate company content. Response code: %d\n", response_code);
        exit(EXIT_FAILURE);
    }

	system("cls");
	puts("Server is restarting, please wait...");
	sleep(40);

    char generate_company_data_command[BUFFER_SIZE];
    snprintf(generate_company_data_command, BUFFER_SIZE,
             "curl -X POST -H \"Authorization: Bearer %s\" -H \"Content-Type: application/json\" "
             "-d \"{\\\"company-name\\\": \\\"%s\\\", \\\"company-email\\\": \\\"%s\\\", \\\"password\\\": \\\"%s\\\"}\" %s/generate/company-data",
             auth_key, company_name, company_email, password, api_url);

    execute_curl_command(generate_company_data_command, &response_code);

    if (response_code != 200 && response_code != 0) {
        fprintf(stderr, "Error: Failed to generate company data. Response code: %d\n", response_code);
        exit(EXIT_FAILURE);
    }

    printf("Company data generated successfully!\n");
    getchar();
    return 0;
}

